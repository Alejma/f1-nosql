const Driver = require('../models/Driver');
const Team = require('../models/Team');
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

      // Crear piloto
      const driver = new Driver({
        ...driverData,
        teamName: team.name
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
      return await Driver.find().sort({ points: -1 });
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
      return driver;
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

      // Si se actualiza el equipo, verificar que existe
      if (updateData.teamId) {
        const newTeam = await Team.findById(updateData.teamId);
        if (!newTeam) {
          throw new Error('Equipo no encontrado');
        }
        updateData.teamName = newTeam.name;

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
          }
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

