const standingsService = require('../services/standingsService');

const standingsController = {
  /**
   * GET /standings/current
   * Obtener tabla de posiciones actual
   */
  getCurrentStandings: async (req, res) => {
    try {
      const standings = await standingsService.getCurrentStandings();
      res.status(200).json({
        success: true,
        data: standings
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  /**
   * POST /standings/telemetry
   * Guardar telemetría de un piloto
   */
  saveTelemetry: async (req, res) => {
    try {
      const result = await standingsService.saveTelemetry(req.body);
      res.status(201).json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  },

  /**
   * PUT /standings/leaderboard
   * Actualizar leaderboard en Redis
   */
  updateLeaderboard: async (req, res) => {
    try {
      const result = await standingsService.updateLeaderboard(req.body);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  },

  /**
   * GET /standings/telemetry/:driverId
   * Obtener telemetría de un piloto
   */
  getTelemetry: async (req, res) => {
    try {
      const telemetry = await standingsService.getTelemetry(req.params.driverId);
      if (!telemetry) {
        return res.status(404).json({
          success: false,
          error: 'Telemetría no encontrada'
        });
      }
      res.status(200).json({
        success: true,
        data: telemetry
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
};

module.exports = standingsController;

