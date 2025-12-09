const Race = require('../models/Race');
const Team = require('../models/Team');
const Driver = require('../models/Driver');

async function rebuildTeamPointsFromRaces() {
  // 1) Sumar puntos por piloto desde TODAS las carreras
  const agg = await Race.aggregate([
    { $unwind: "$results" },
    {
      $group: {
        _id: "$results.driverId",
        points: { $sum: "$results.points" }
      }
    }
  ]);

  // Si no hay carreras
  if (!agg.length) {
    // opcional: poner todos los teams en 0
    await Team.updateMany({}, { $set: { points: 0, drivers: [] } });
    return;
  }

  // 2) Obtener info de pilotos para saber teamId y name actual
  const driverIds = agg.map(a => a._id);
  const drivers = await Driver.find({ _id: { $in: driverIds } }).lean();

  const driverMap = new Map(drivers.map(d => [d._id.toString(), d]));

  // 3) Agrupar por teamId
  const teamBuckets = new Map(); // teamId -> [{driverId, driverName, driverPoints}]

  for (const row of agg) {
    const d = driverMap.get(row._id.toString());
    if (!d || !d.teamId) continue;

    const teamId = d.teamId.toString();

    if (!teamBuckets.has(teamId)) teamBuckets.set(teamId, []);

    teamBuckets.get(teamId).push({
      driverId: d._id,
      driverName: d.name,
      driverPoints: row.points
    });
  }

  // 4) Preparar operaciones de actualización
  const ops = [];

  // a) Para equipos que sí tienen pilotos con puntos
  for (const [teamId, driverList] of teamBuckets.entries()) {
    const total = driverList.reduce((s, x) => s + (x.driverPoints || 0), 0);

    ops.push({
      updateOne: {
        filter: { _id: teamId },
        update: {
          $set: {
            drivers: driverList,
            points: total
          }
        }
      }
    });
  }

  // b) Para equipos que no aparecieron en carreras, dejarlos en 0
  const touchedIds = [...teamBuckets.keys()];
  ops.push({
    updateMany: {
      filter: { _id: { $nin: touchedIds } },
      update: { $set: { drivers: [], points: 0 } }
    }
  });

  if (ops.length) {
    await Team.bulkWrite(ops, { ordered: true });
  }
}

module.exports = { rebuildTeamPointsFromRaces };
