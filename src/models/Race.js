const mongoose = require('mongoose');

const raceResultSchema = new mongoose.Schema({
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
  position: {
    type: Number,
    required: true,
    min: 1
  },
  points: {
    type: Number,
    default: 0,
    min: 0
  }
}, { _id: false });

const raceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  circuit: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    required: true
  },
  results: [raceResultSchema]
}, {
  timestamps: true
});

// Índices
raceSchema.index({ date: -1 });
raceSchema.index({ name: 1 });

const Race = mongoose.model('Race', raceSchema);

module.exports = Race;

