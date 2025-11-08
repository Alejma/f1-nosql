const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  number: {
    type: Number,
    required: true,
    unique: true
  },
  nationality: {
    type: String,
    required: true,
    trim: true
  },
  teamName: {
    type: String,
    required: true,
    trim: true
  },
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  team: {
    // Información desnormalizada del equipo
    name: {
      type: String,
      trim: true
    },
    country: {
      type: String,
      trim: true
    },
    points: {
      type: Number,
      default: 0
    }
  },
  points: {
    type: Number,
    default: 0,
    min: 0
  },
  currentPosition: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Índices para mejorar búsquedas
driverSchema.index({ teamId: 1 });
driverSchema.index({ points: -1 });
driverSchema.index({ name: 1 });

const Driver = mongoose.model('Driver', driverSchema);

module.exports = Driver;

