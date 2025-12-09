const Team = require('../models/Team');

async function dedupeTeamDrivers() {
  const teams = await Team.find();

  for (const team of teams) {
    const map = new Map();

    for (const d of (team.drivers || [])) {
      const id = d.driverId?.toString();
      if (!id) continue;

      const prev = map.get(id);
      if (!prev) {
        map.set(id, d);
      } else {
        // conserva el registro con más puntos
        const prevPts = prev.driverPoints || 0;
        const currPts = d.driverPoints || 0;

        if (currPts > prevPts) {
          map.set(id, d);
        } else if (currPts === prevPts && d.driverName && !prev.driverName) {
          map.set(id, d);
        }
      }
    }

    team.drivers = [...map.values()];
    team.points = team.drivers.reduce((s, x) => s + (x.driverPoints || 0), 0);

    await team.save();
  }

  return { teamsProcessed: teams.length };
}

module.exports = { dedupeTeamDrivers };