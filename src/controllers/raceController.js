const raceService = require('../services/raceService');

const raceController = {
  /**
   * POST /races
   * Crear una nueva carrera
   */
  createRace: async (req, res) => {
    try {
      const race = await raceService.createRace(req.body);
      res.status(201).json({
        success: true,
        data: race,
        message: 'Carrera registrada correctamente'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  },

  /**
   * GET /races
   * Obtener todas las carreras
   */
  getAllRaces: async (req, res) => {
    try {
      const races = await raceService.getAllRaces();
      res.status(200).json({
        success: true,
        count: races.length,
        data: races
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  /**
   * GET /races/:id
   * Obtener carrera por ID
   */
  getRaceById: async (req, res) => {
    try {
      const race = await raceService.getRaceById(req.params.id);
      res.status(200).json({
        success: true,
        data: race
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        error: error.message
      });
    }
  },

  /**
   * PUT /races/:id
   * Actualizar carrera
   */
  updateRace: async (req, res) => {
    try {
      const race = await raceService.updateRace(req.params.id, req.body);
      res.status(200).json({
        success: true,
        data: race,
        message: 'Carrera actualizada correctamente'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  },

  /**
   * DELETE /races/:id
   * Eliminar carrera
   */
  deleteRace: async (req, res) => {
    try {
      const result = await raceService.deleteRace(req.params.id);
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

module.exports = raceController;

