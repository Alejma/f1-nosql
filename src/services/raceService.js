const Race = require('../models/Race');
const Season = require('../models/Season');
const Driver = require('../models/Driver');
const Team = require('../models/Team');
const { cacheAsideList, cacheAsideItem, deleteCache, deleteCachePattern } = require('../utils/cache');

const raceService = {
  /**
   * Crear una nueva carrera
   */
  createRace: async (raceData) => {
    try {
      // Validar que los pilotos en los resultados existen
      if (raceData.results && raceData.results.length > 0) {
        for (const result of raceData.results) {
          const driver = await Driver.findById(result.driverId);
          if (!driver) {
            throw new Error(`Piloto con ID ${result.driverId} no encontrado`);
          }
          
          // Asegurar que los datos redundantes estén actualizados
          result.driverName = driver.name;
          result.teamName = driver.teamName;
        }
      }

      const race = new Race(raceData);
      await race.save();

      // Agregar carrera a la temporada correspondiente
      const raceYear = new Date(raceData.date).getFullYear();
      let season = await Season.findOne({ year: raceYear });
      
      if (!season) {
        season = new Season({
          year: raceYear,
          races: [],
          standings: []
        });
      }

      // Encontrar ganador
      const winner = race.results.find(r => r.position === 1);
      
      season.races.push({
        raceId: race._id,
        raceName: race.name,
        winnerName: winner ? winner.driverName : null
      });

      // Actualizar puntos de pilotos y standings de la temporada
      for (const result of race.results) {
        const driver = await Driver.findById(result.driverId);
        if (driver) {
          driver.points += result.points;
          await driver.save();
        }

        // Actualizar o agregar a standings
        let standing = season.standings.find(
          s => s.driverId.toString() === result.driverId.toString()
        );

        if (standing) {
          standing.points += result.points;
        } else {
          season.standings.push({
            driverId: result.driverId,
            driverName: result.driverName,
            teamName: result.teamName,
            points: result.points,
            position: 1 // Se actualizará después
          });
        }
      }

      // Reordenar standings por puntos
      season.standings.sort((a, b) => {
        if (b.points !== a.points) {
          return b.points - a.points;
        }
        return a.position - b.position;
      });

      // Actualizar posiciones
      season.standings.forEach((standing, index) => {
        standing.position = index + 1;
      });

      await season.save();

      // Invalidar caché según RF-REDIS-03
      await deleteCache(`race:${race._id}`);
      await deleteCachePattern(`races:list:${raceYear}`);
      await deleteCachePattern(`races:list:*`);
      await deleteCachePattern('standings:*');
      await deleteCachePattern('drivers:all');
      await deleteCachePattern('teams:all');

      // === NUEVO: ACTUALIZAR PUNTOS EN TEAMS ===
      // Para minimizar llamadas, usamos bulkWrite:
      const teamOps = [];
      const teamIdsTouched = new Set();

       for (const result of race.results) {
        // Necesitamos el piloto y su teamId actual
        const driver = await Driver.findById(result.driverId).lean();
        if (!driver || !driver.teamId) continue;
       
        const teamId = driver.teamId.toString();
        teamIdsTouched.add(teamId);

        // 1) Asegurar que el piloto exista en el array drivers del team (si no, lo añadimos con 0)
        teamOps.push({
          updateOne: {
            filter: { _id: teamId },
            update: {
              $addToSet: {
                drivers: {
                  driverId: driver._id,
                  driverName: driver.name,
                  driverPoints: 0
                }
              }
            }
          }
        });

        // 2) Incrementar puntos del team y del piloto dentro del team
        teamOps.push({
          updateOne: {
            filter: { _id: teamId, "drivers.driverId": driver._id },
            update: {
              $inc: {
                points: result.points,
                "drivers.$.driverPoints": result.points
              },
              $set: {
                "drivers.$.driverName": driver.name // mantener nombre fresco
              }
            }
          }
        });
      }

      if (teamOps.length > 0) {
        await Team.bulkWrite(teamOps, { ordered: true });
      }

      await Promise.all(
      [...teamIdsTouched].map(teamId =>
        Team.updateOne(
          { _id: teamId },
          [
            {
              $set: {
                points: {
                  $sum: {
                    $map: {
                      input: "$drivers",
                      as: "d",
                      in: { $ifNull: ["$$d.driverPoints", 0] }
                    }
                  }
                }
              }
            }
          ]
        )
      )
    );

      return race;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Obtener todas las carreras (con caché)
   */
  getAllRaces: async () => {
    try {
      // Obtener año actual para cachear por año
      const currentYear = new Date().getFullYear();
      
      const result = await cacheAsideList(`races:list:${currentYear}`, async () => {
        const races = await Race.find().sort({ date: -1 });
        return races.map(r => r.toObject());
      });
      
      return result.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Obtener carrera por ID (con caché)
   */
  getRaceById: async (raceId) => {
    try {
      const result = await cacheAsideItem(`race:${raceId}`, async () => {
        const race = await Race.findById(raceId);
        if (!race) {
          throw new Error('Carrera no encontrada');
        }
        return race.toObject();
      });
      
      return result.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Actualizar carrera
   */
  updateRace: async (raceId, updateData) => {
    try {
      const race = await Race.findById(raceId);
      if (!race) {
        throw new Error('Carrera no encontrada');
      }

      // Validar resultados si se actualizan
      if (updateData.results) {
        for (const result of updateData.results) {
          const driver = await Driver.findById(result.driverId);
          if (!driver) {
            throw new Error(`Piloto con ID ${result.driverId} no encontrado`);
          }
          result.driverName = driver.name;
          result.teamName = driver.teamName;
        }
      }

      Object.assign(race, updateData);
      await race.save();

      // Invalidar caché según RF-REDIS-03
      const raceYear = new Date(race.date).getFullYear();
      await deleteCache(`race:${raceId}`);
      await deleteCachePattern(`races:list:${raceYear}`);
      await deleteCachePattern(`races:list:*`);
      await deleteCachePattern('standings:*');

      return race;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Eliminar carrera
   */
  deleteRace: async (raceId) => {
    try {
      const race = await Race.findById(raceId);
      if (!race) {
        throw new Error('Carrera no encontrada');
      }
      
      const raceYear = new Date(race.date).getFullYear();
      
      // Invalidar caché antes de eliminar según RF-REDIS-03
      await deleteCache(`race:${raceId}`);
      await deleteCachePattern(`races:list:${raceYear}`);
      await deleteCachePattern(`races:list:*`);
      await deleteCachePattern('standings:*');
      
      await Race.findByIdAndDelete(raceId);
      
      return { message: 'Carrera eliminada correctamente' };
    } catch (error) {
      throw error;
    }
  }
};

module.exports = raceService;

