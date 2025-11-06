const driverService = require('../services/driverService');

const driverController = {
  /**
   * POST /drivers
   * Crear un nuevo piloto
   */
  createDriver: async (req, res) => {
    try {
      const driver = await driverService.createDriver(req.body);
      res.status(201).json({
        success: true,
        data: driver
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  },

  /**
   * GET /drivers
   * Obtener todos los pilotos
   */
  getAllDrivers: async (req, res) => {
    try {
      const drivers = await driverService.getAllDrivers();
      res.status(200).json({
        success: true,
        count: drivers.length,
        data: drivers
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  /**
   * GET /drivers/:id
   * Obtener piloto por ID
   */
  getDriverById: async (req, res) => {
    try {
      const driver = await driverService.getDriverById(req.params.id);
      res.status(200).json({
        success: true,
        data: driver
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        error: error.message
      });
    }
  },

  /**
   * PUT /drivers/:id
   * Actualizar piloto
   */
  updateDriver: async (req, res) => {
    try {
      const driver = await driverService.updateDriver(req.params.id, req.body);
      res.status(200).json({
        success: true,
        data: driver,
        message: 'Piloto actualizado correctamente'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  },

  /**
   * DELETE /drivers/:id
   * Eliminar piloto
   */
  deleteDriver: async (req, res) => {
    try {
      const result = await driverService.deleteDriver(req.params.id);
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

module.exports = driverController;

