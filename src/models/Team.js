const mongoose = require('mongoose');

const teamDriverSchema = new mongoose.Schema({
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
  driverPoints: {
    type: Number,
    default: 0,
    min: 0
  }
}, { _id: false });

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  country: {
    type: String,
    required: true,
    trim: true
  },
  points: {
    type: Number,
    default: 0,
    min: 0
  },
  drivers: [teamDriverSchema]
}, {
  timestamps: true
});

// Índices (name ya tiene índice único por el unique: true)
teamSchema.index({ points: -1 });

const Team = mongoose.model('Team', teamSchema);

module.exports = Team;

