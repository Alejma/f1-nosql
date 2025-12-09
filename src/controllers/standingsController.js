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
  }
};

module.exports = standingsController;

