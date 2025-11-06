require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

const driverRoutes = require('./routes/driverRoutes');
const teamRoutes = require('./routes/teamRoutes');
const raceRoutes = require('./routes/raceRoutes');
const standingsRoutes = require('./routes/standingsRoutes');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'F1 Pro API Documentation'
}));

// Conectar a MongoDB
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/f1db';

if (!mongoURI.startsWith('mongodb://') && !mongoURI.startsWith('mongodb+srv://')) {
  console.error('❌ MONGO_URI inválida. Debe comenzar con "mongodb://" o "mongodb+srv://"');
  console.error('   URI actual:', mongoURI);
  console.error('   Por favor, verifica tu archivo .env');
  process.exit(1);
}

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Conectado a MongoDB');
})
.catch((error) => {
  console.error('❌ Error conectando a MongoDB:', error.message);
  console.error('   Verifica que MongoDB esté corriendo y que MONGO_URI sea correcta');
  process.exit(1);
});

// Configurar Redis (se exporta en redis.js)
require('./config/redis');

// Rutas
app.use('/drivers', driverRoutes);
app.use('/teams', teamRoutes);
app.use('/races', raceRoutes);
app.use('/standings', standingsRoutes);

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Verificar estado del servidor
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Servidor funcionando correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *                 message:
 *                   type: string
 *                   example: F1 Pro API está funcionando
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
// Ruta de salud
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'F1 Pro API está funcionando',
    timestamp: new Date().toISOString()
  });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Error interno del servidor'
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});

module.exports = app;

