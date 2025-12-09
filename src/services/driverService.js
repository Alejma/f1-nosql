const Driver = require('../models/Driver');
const Team = require('../models/Team');
const Race = require('../models/Race');
const { syncDriverData } = require('../utils/updateHelpers');

const driverService = {
  /**
   * Crear un nuevo piloto
   */
  createDriver: async (driverData) => {
    try {
      // Verificar que el equipo existe
      const team = await Team.findById(driverData.teamId);
      if (!team) {
        throw new Error('Equipo no encontrado');
      }

      // Crear piloto con información desnormalizada del equipo
      const driver = new Driver({
        ...driverData,
        teamName: team.name,
        team: {
          name: team.name,
          country: team.country,
          points: team.points
        }
      });
      await driver.save();

      // Agregar piloto al equipo
      team.drivers.push({
        driverId: driver._id,
        driverName: driver.name,
        driverPoints: driver.points
      });
      
      // Recalcular puntos del equipo
      team.points = team.drivers.reduce((sum, d) => sum + d.driverPoints, 0);
      await team.save();

      return driver;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Obtener todos los pilotos
   */
  getAllDrivers: async () => {
    try {
      const drivers = await Driver.find().sort({ points: -1 });
      
      // Obtener todos los equipos únicos de una vez para optimizar
      const teamIds = [...new Set(drivers.map(d => d.teamId.toString()))];
      const teams = await Team.find({ _id: { $in: teamIds } });
      const teamMap = new Map(teams.map(t => [t._id.toString(), t]));
      
      // Actualizar información del equipo desnormalizada si está desactualizada
      const updates = [];
      for (const driver of drivers) {
        const team = teamMap.get(driver.teamId.toString());
        if (team && (!driver.team || !driver.team.name || driver.team.name !== team.name)) {
          driver.team = {
            name: team.name,
            country: team.country,
            points: team.points
          };
          driver.teamName = team.name;
          updates.push(driver.save());
        }
      }
      
      // Ejecutar todas las actualizaciones en paralelo si hay alguna
      if (updates.length > 0) {
        await Promise.all(updates);
      }
      
      return drivers;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Obtener piloto por ID
   */
  getDriverById: async (driverId) => {
    try {
      const driver = await Driver.findById(driverId);
      if (!driver) {
        throw new Error('Piloto no encontrado');
      }
      
      // Actualizar información del equipo desnormalizada si está desactualizada
      if (!driver.team || !driver.team.name || driver.team.name !== driver.teamName) {
        const team = await Team.findById(driver.teamId);
        if (team) {
          driver.team = {
            name: team.name,
            country: team.country,
            points: team.points
          };
          driver.teamName = team.name;
          await driver.save();
        }
      }

       // === NUEVO: últimas 5 posiciones del piloto ===
      const lastRaces = await Race.find(
        { "results.driverId": driver._id },
        {
          name: 1,
          date: 1,
          circuit: 1, // si existe en tu schema
          results: { $elemMatch: { driverId: driver._id } }
        }
      ) 
        .sort({ date: -1 })
        .limit(5)
        .lean();

      const last5Positions = lastRaces.map(r => ({
        raceId: r._id,
        raceName: r.name,
        date: r.date,
        circuit: r.circuit,
        position: r.results?.[0]?.position ?? null,
        points: r.results?.[0]?.points ?? 0
      }));

      // === Calcular estadísticas (wins, podiums, poles, dnfs) ===
      const allRaces = await Race.find(
        { "results.driverId": driver._id }
      ).lean();

      let wins = 0;
      let podiums = 0;
      let polePositions = 0;
      let dnfs = 0;

      for (const race of allRaces) {
        const raceResult = race.results?.find(r => r.driverId.toString() === driver._id.toString());
        if (raceResult) {
          // Victories: position 1
          if (raceResult.position === 1) {
            wins++;
            polePositions++; // Aproximación: asumimos que el ganador tuvo pole
          }
          // Podiums: positions 1, 2, 3
          if (raceResult.position <= 3) {
            podiums++;
          }
          // DNF: position > número total de resultados en esa carrera (no terminó)
          if (raceResult.position > race.results.length) {
            dnfs++;
          }
        }
      }
      
      return {
        ...driver.toObject(),
        last5Positions,
        wins,
        podiums,
        polePositions,
        dnfs
      };

    } catch (error) {
      throw error;
    }
  },

  /**
   * Actualizar piloto
   */
  updateDriver: async (driverId, updateData) => {
    try {
      const driver = await Driver.findById(driverId);
      if (!driver) {
        throw new Error('Piloto no encontrado');
      }

      // Si se actualiza el equipo, verificar que existe y actualizar info desnormalizada
      if (updateData.teamId) {
        const newTeam = await Team.findById(updateData.teamId);
        if (!newTeam) {
          throw new Error('Equipo no encontrado');
        }
        updateData.teamName = newTeam.name;
        updateData.team = {
          name: newTeam.name,
          country: newTeam.country,
          points: newTeam.points
        };

        // Remover piloto del equipo anterior
        const oldTeam = await Team.findById(driver.teamId);
        if (oldTeam) {
          oldTeam.drivers = oldTeam.drivers.filter(
            d => d.driverId.toString() !== driverId.toString()
          );
          oldTeam.points = oldTeam.drivers.reduce((sum, d) => sum + d.driverPoints, 0);
          await oldTeam.save();
        }

        // Agregar piloto al nuevo equipo
        newTeam.drivers.push({
          driverId: driver._id,
          driverName: driver.name,
          driverPoints: driver.points
        });
        newTeam.points = newTeam.drivers.reduce((sum, d) => sum + d.driverPoints, 0);
        await newTeam.save();
      }

      // Actualizar piloto
      Object.assign(driver, updateData);
      await driver.save();

      // Actualizar puntos del equipo actual si cambió
      if (updateData.points !== undefined) {
        const team = await Team.findById(driver.teamId);
        if (team) {
          const driverRef = team.drivers.find(
            d => d.driverId.toString() === driverId.toString()
          );
          if (driverRef) {
            driverRef.driverPoints = driver.points;
            team.points = team.drivers.reduce((sum, d) => sum + d.driverPoints, 0);
            await team.save();
            
            // Actualizar información desnormalizada del equipo
            driver.team.points = team.points;
            await driver.save();
          }
        }
      }
      
      // Si no se actualizó el equipo pero el equipo cambió, actualizar info desnormalizada
      if (!updateData.teamId && driver.teamId) {
        const team = await Team.findById(driver.teamId);
        if (team && (!driver.team || driver.team.name !== team.name)) {
          driver.team = {
            name: team.name,
            country: team.country,
            points: team.points
          };
          driver.teamName = team.name;
          await driver.save();
        }
      }

      // Sincronizar datos redundantes
      await syncDriverData(driverId);

      return driver;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Eliminar piloto
   */
  deleteDriver: async (driverId) => {
    try {
      const driver = await Driver.findById(driverId);
      if (!driver) {
        throw new Error('Piloto no encontrado');
      }

      // Remover del equipo
      const team = await Team.findById(driver.teamId);
      if (team) {
        team.drivers = team.drivers.filter(
          d => d.driverId.toString() !== driverId.toString()
        );
        team.points = team.drivers.reduce((sum, d) => sum + d.driverPoints, 0);
        await team.save();
      }

      await Driver.findByIdAndDelete(driverId);
      return { message: 'Piloto eliminado correctamente' };
    } catch (error) {
      throw error;
    }
  }
};

module.exports = driverService;

