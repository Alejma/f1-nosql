const Driver = require('../models/Driver');
const Team = require('../models/Team');
const Race = require('../models/Race');
const Season = require('../models/Season');

/**
 * Actualiza la información del piloto en todos los equipos donde aparezca
 */
const updateDriverInTeams = async (driverId) => {
  try {
    const driver = await Driver.findById(driverId);
    if (!driver) {
      throw new Error(`Piloto con ID ${driverId} no encontrado`);
    }

    // Actualizar en el equipo principal
    await Team.updateOne(
      { _id: driver.teamId },
      {
        $set: {
          'drivers.$[elem].driverName': driver.name,
          'drivers.$[elem].driverPoints': driver.points
        }
      },
      {
        arrayFilters: [{ 'elem.driverId': driverId }]
      }
    );

    // También actualizar puntos totales del equipo
    const team = await Team.findById(driver.teamId);
    if (team) {
      const totalPoints = team.drivers.reduce((sum, d) => sum + d.driverPoints, 0);
      await Team.updateOne(
        { _id: driver.teamId },
        { $set: { points: totalPoints } }
      );
    }

    console.log(`✅ Actualizado piloto ${driver.name} en equipos`);
  } catch (error) {
    console.error(`❌ Error actualizando piloto en equipos:`, error);
    throw error;
  }
};

/**
 * Actualiza la información del piloto en todas las carreras donde aparezca
 */
const updateDriverInRaces = async (driverId) => {
  try {
    const driver = await Driver.findById(driverId);
    if (!driver) {
      throw new Error(`Piloto con ID ${driverId} no encontrado`);
    }

    await Race.updateMany(
      { 'results.driverId': driverId },
      {
        $set: {
          'results.$[elem].driverName': driver.name,
          'results.$[elem].teamName': driver.teamName
        }
      },
      {
        arrayFilters: [{ 'elem.driverId': driverId }]
      }
    );

    console.log(`✅ Actualizado piloto ${driver.name} en carreras`);
  } catch (error) {
    console.error(`❌ Error actualizando piloto en carreras:`, error);
    throw error;
  }
};

/**
 * Actualiza la información del piloto en todas las temporadas donde aparezca
 */
const updateDriverInSeason = async (driverId) => {
  try {
    const driver = await Driver.findById(driverId);
    if (!driver) {
      throw new Error(`Piloto con ID ${driverId} no encontrado`);
    }

    await Season.updateMany(
      { 'standings.driverId': driverId },
      {
        $set: {
          'standings.$[elem].driverName': driver.name,
          'standings.$[elem].teamName': driver.teamName,
          'standings.$[elem].points': driver.points
        }
      },
      {
        arrayFilters: [{ 'elem.driverId': driverId }]
      }
    );

    // Reordenar posiciones en cada temporada actualizada
    const seasons = await Season.find({ 'standings.driverId': driverId });
    for (const season of seasons) {
      season.standings.sort((a, b) => {
        if (b.points !== a.points) {
          return b.points - a.points;
        }
        return a.position - b.position;
      });
      
      // Actualizar posiciones
      season.standings.forEach((standing, index) => {
        standing.position = index + 1;
      });
      
      await season.save();
    }

    console.log(`✅ Actualizado piloto ${driver.name} en temporadas`);
  } catch (error) {
    console.error(`❌ Error actualizando piloto en temporadas:`, error);
    throw error;
  }
};

/**
 * Actualiza la información del equipo en todos los pilotos que pertenecen a él
 */
const updateTeamInDrivers = async (teamId) => {
  try {
    const team = await Team.findById(teamId);
    if (!team) {
      throw new Error(`Equipo con ID ${teamId} no encontrado`);
    }

    await Driver.updateMany(
      { teamId: teamId },
      {
        $set: {
          teamName: team.name
        }
      }
    );

    console.log(`✅ Actualizado equipo ${team.name} en pilotos`);
  } catch (error) {
    console.error(`❌ Error actualizando equipo en pilotos:`, error);
    throw error;
  }
};

/**
 * Sincroniza todos los datos redundantes de un piloto
 */
const syncDriverData = async (driverId) => {
  try {
    await Promise.all([
      updateDriverInTeams(driverId),
      updateDriverInRaces(driverId),
      updateDriverInSeason(driverId)
    ]);
    console.log(`✅ Sincronización completa para piloto ${driverId}`);
  } catch (error) {
    console.error(`❌ Error en sincronización completa:`, error);
    throw error;
  }
};

/**
 * Sincroniza todos los datos redundantes de un equipo
 */
const syncTeamData = async (teamId) => {
  try {
    await updateTeamInDrivers(teamId);
    
    // Actualizar también los pilotos del equipo
    const team = await Team.findById(teamId);
    if (team && team.drivers) {
      for (const driverRef of team.drivers) {
        await syncDriverData(driverRef.driverId);
      }
    }
    
    console.log(`✅ Sincronización completa para equipo ${teamId}`);
  } catch (error) {
    console.error(`❌ Error en sincronización completa del equipo:`, error);
    throw error;
  }
};

module.exports = {
  updateDriverInTeams,
  updateDriverInRaces,
  updateDriverInSeason,
  updateTeamInDrivers,
  syncDriverData,
  syncTeamData
};

