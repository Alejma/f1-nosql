const teamService = require('../services/teamService');

const teamController = {
  /**
   * POST /teams
   * Crear un nuevo equipo
   */
  createTeam: async (req, res) => {
    try {
      const team = await teamService.createTeam(req.body);
      res.status(201).json({
        success: true,
        data: team
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  },

  /**
   * GET /teams
   * Obtener todos los equipos
   */
  getAllTeams: async (req, res) => {
    try {
      const teams = await teamService.getAllTeams();
      res.status(200).json({
        success: true,
        count: teams.length,
        data: teams
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  /**
   * GET /teams/:id
   * Obtener equipo por ID
   */
  getTeamById: async (req, res) => {
    try {
      const team = await teamService.getTeamById(req.params.id);
      res.status(200).json({
        success: true,
        data: team
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        error: error.message
      });
    }
  },

  /**
   * PUT /teams/:id
   * Actualizar equipo
   */
  updateTeam: async (req, res) => {
    try {
      const team = await teamService.updateTeam(req.params.id, req.body);
      res.status(200).json({
        success: true,
        data: team,
        message: 'Equipo actualizado correctamente'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  },

  /**
   * DELETE /teams/:id
   * Eliminar equipo
   */
  deleteTeam: async (req, res) => {
    try {
      const result = await teamService.deleteTeam(req.params.id);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        error: error.message
      });
    }
  }
};

module.exports = teamController;

