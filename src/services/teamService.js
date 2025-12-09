const Team = require('../models/Team');
const { syncTeamData } = require('../utils/updateHelpers');

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
      return team;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Obtener todos los equipos
   */
  getAllTeams: async () => {
    try {
      return await Team.find().sort({ points: -1 });
    } catch (error) {
      throw error;
    }
  },

  /**
   * Obtener equipo por ID
   */
  getTeamById: async (teamId) => {
    try {
      const team = await Team.findById(teamId);
      if (!team) {
        throw new Error('Equipo no encontrado');
      }
      return team;
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
      return { message: 'Equipo eliminado correctamente' };
    } catch (error) {
      throw error;
    }
  }
};

module.exports = teamService;

