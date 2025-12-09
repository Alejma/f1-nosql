const Team = require('../models/Team');
const { syncTeamData } = require('../utils/updateHelpers');
const { cacheAsideList, cacheAsideItem, deleteCache, deleteCachePattern } = require('../utils/cache');

const teamService = {


   
  recalcTeamPoints: async (teamId) => {
    const team = await Team.findById(teamId);
    if (!team) throw new Error('Equipo no encontrado');

    team.points = (team.drivers || []).reduce(
      (sum, d) => sum + (d.driverPoints || 0),
      0
    );

    await team.save();
    return team;
  },

  /**
   * Crear un nuevo equipo
   */
  createTeam: async (teamData) => {
    try {
      const team = new Team(teamData);
      await team.save();
      
      // Invalidar caché según RF-REDIS-03
      await deleteCachePattern('teams:all');
      await deleteCachePattern('drivers:all');
      await deleteCachePattern('standings:*');
      
      return team;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Obtener todos los equipos (con caché)
   */
  getAllTeams: async () => {
    try {
      const result = await cacheAsideList('teams:all', async () => {
        const teams = await Team.find().sort({ points: -1 });
        return teams.map(t => t.toObject());
      });
      
      return result.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Obtener equipo por ID (con caché)
   */
  getTeamById: async (teamId) => {
    try {
      const result = await cacheAsideItem(`team:${teamId}`, async () => {
        const team = await Team.findById(teamId);
        if (!team) {
          throw new Error('Equipo no encontrado');
        }
        return team.toObject();
      });
      
      return result.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Actualizar equipo
   */
  updateTeam: async (teamId, updateData) => {
    try {
      const team = await Team.findById(teamId);
      if (!team) {
        throw new Error('Equipo no encontrado');
      }

      Object.assign(team, updateData);
      await team.save();

      // Sincronizar datos redundantes
      await syncTeamData(teamId);

      // Invalidar caché según RF-REDIS-03
      await deleteCache(`team:${teamId}`);
      await deleteCachePattern('teams:all');
      await deleteCachePattern('drivers:all');
      await deleteCachePattern('standings:*');

      return team;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Eliminar equipo
   */
  deleteTeam: async (teamId) => {
    try {
      const team = await Team.findById(teamId);
      if (!team) {
        throw new Error('Equipo no encontrado');
      }

      await Team.findByIdAndDelete(teamId);
      
      // Invalidar caché según RF-REDIS-03
      await deleteCache(`team:${teamId}`);
      await deleteCachePattern('teams:all');
      await deleteCachePattern('drivers:all');
      await deleteCachePattern('standings:*');
      
      return { message: 'Equipo eliminado correctamente' };
    } catch (error) {
      throw error;
    }
  }
};

module.exports = teamService;

