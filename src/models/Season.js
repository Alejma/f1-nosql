const mongoose = require('mongoose');

const raceReferenceSchema = new mongoose.Schema({
  raceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Race',
    required: true
  },
  raceName: {
    type: String,
    required: true,
    trim: true
  },
  winnerName: {
    type: String,
    trim: true
  }
}, { _id: false });

const standingsSchema = new mongoose.Schema({
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    required: true
  },
  driverName: {
    type: String,
    required: true,
    trim: true
  },
  teamName: {
    type: String,
    required: true,
    trim: true
  },
  points: {
    type: Number,
    default: 0,
    min: 0
  },
  position: {
    type: Number,
    required: true,
    min: 1
  }
}, { _id: false });

const seasonSchema = new mongoose.Schema({
  year: {
    type: Number,
    required: true,
    unique: true
  },
  races: [raceReferenceSchema],
  standings: [standingsSchema]
}, {
  timestamps: true
});

// No necesitamos índice explícito en year porque ya tiene unique: true
// El índice único se crea automáticamente

const Season = mongoose.model('Season', seasonSchema);

module.exports = Season;

