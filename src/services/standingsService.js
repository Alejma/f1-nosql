const Season = require('../models/Season');
const Driver = require('../models/Driver');
const redisClient = require('../config/redis');

const standingsService = {
  /**
   * Obtener standings actuales (combinando MongoDB y Redis)
   */
  getCurrentStandings: async () => {
    try {
      const currentYear = new Date().getFullYear();
      
      // Intentar obtener leaderboard de Redis (carrera activa)
      const redisLeaderboard = await redisClient.get('leaderboard:current');
      
      if (redisLeaderboard) {
        try {
          const leaderboard = JSON.parse(redisLeaderboard);
          
          // Si el leaderboard tiene la estructura completa, devolverlo directamente
          if (leaderboard.length > 0 && leaderboard[0].driverName && leaderboard[0].team) {
            return {
              source: 'redis',
              year: currentYear,
              raceActive: true,
              standings: leaderboard.slice(0, 10).map(item => ({
                driverName: item.driverName || item.driver,
                team: item.team || item.teamName,
                points: item.points || 0,
                position: item.position
              }))
            };
          }
          
          // Si solo tiene datos básicos, intentar obtener puntos desde MongoDB
          const standingsWithPoints = await Promise.all(
            leaderboard.slice(0, 10).map(async (item) => {
              try {
                const driver = await Driver.findById(item.driverId);
                return {
                  driverName: item.driverName || driver?.name || 'Unknown',
                  team: driver?.teamName || item.teamName || 'Unknown',
                  points: driver?.points || item.points || 0,
                  position: item.position
                };
              } catch (err) {
                return {
                  driverName: item.driverName || 'Unknown',
                  team: item.teamName || 'Unknown',
                  points: item.points || 0,
                  position: item.position
                };
              }
            })
          );
          
          return {
            source: 'redis',
            year: currentYear,
            raceActive: true,
            standings: standingsWithPoints
          };
        } catch (parseError) {
          console.error('Error parseando leaderboard de Redis:', parseError);
        }
      }

      // Si no hay carrera activa, obtener de MongoDB
      const season = await Season.findOne({ year: currentYear });
      
      if (!season || !season.standings || season.standings.length === 0) {
        // Si no hay temporada actual, buscar la más reciente
        const latestSeason = await Season.findOne().sort({ year: -1 });
        
        if (latestSeason && latestSeason.standings) {
          return {
            source: 'mongodb',
            year: latestSeason.year,
            raceActive: false,
            standings: latestSeason.standings
              .slice(0, 10)
              .map(s => ({
                driverName: s.driverName,
                team: s.teamName,
                points: s.points,
                position: s.position
              }))
          };
        }
        
        return {
          source: 'mongodb',
          year: currentYear,
          raceActive: false,
          standings: [],
          message: 'No hay datos de standings disponibles'
        };
      }

      return {
        source: 'mongodb',
        year: season.year,
        raceActive: false,
        standings: season.standings
          .slice(0, 10)
          .map(s => ({
            driverName: s.driverName,
            team: s.teamName,
            points: s.points,
            position: s.position
          }))
      };
    } catch (error) {
      throw error;
    }
  },

  /**
   * Guardar telemetría en Redis
   */
  saveTelemetry: async (telemetryData) => {
    try {
      const key = `telemetry:${telemetryData.driverId}`;
      await redisClient.setex(key, 3600, JSON.stringify(telemetryData)); // Expira en 1 hora
      return { message: 'Telemetría guardada correctamente' };
    } catch (error) {
      throw error;
    }
  },

  /**
   * Actualizar leaderboard en Redis
   */
  updateLeaderboard: async (leaderboardData) => {
    try {
      // Ordenar por posición
      const sorted = leaderboardData.sort((a, b) => a.position - b.position);
      await redisClient.set('leaderboard:current', JSON.stringify(sorted));
      return { message: 'Leaderboard actualizado en Redis' };
    } catch (error) {
      throw error;
    }
  },

  /**
   * Obtener telemetría de un piloto
   */
  getTelemetry: async (driverId) => {
    try {
      const telemetry = await redisClient.get(`telemetry:${driverId}`);
      if (!telemetry) {
        return null;
      }
      return JSON.parse(telemetry);
    } catch (error) {
      throw error;
    }
  }
};

module.exports = standingsService;

