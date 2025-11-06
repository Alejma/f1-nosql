const express = require('express');
const router = express.Router();
const standingsController = require('../controllers/standingsController');

/**
 * @swagger
 * /standings/current:
 *   get:
 *     summary: Obtener tabla de posiciones actual
 *     tags: [Standings]
 *     description: |
 *       Obtiene la tabla de posiciones actual. Si hay una carrera activa en Redis,
 *       devuelve el leaderboard en tiempo real. Si no, devuelve los standings
 *       de la temporada actual desde MongoDB.
 *     responses:
 *       200:
 *         description: Tabla de posiciones actual
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Standings'
 */
router.get('/current', standingsController.getCurrentStandings);

/**
 * @swagger
 * /standings/telemetry:
 *   post:
 *     summary: Guardar telemetría de un piloto
 *     tags: [Standings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Telemetry'
 *           example:
 *             driverId: "507f1f77bcf86cd799439011"
 *             speed: 320
 *             position: 1
 *             lap: 35
 *             fuel: 45.5
 *     responses:
 *       201:
 *         description: Telemetría guardada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *       400:
 *         description: Error en la validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/telemetry', standingsController.saveTelemetry);

/**
 * @swagger
 * /standings/leaderboard:
 *   put:
 *     summary: Actualizar leaderboard en Redis (carrera activa)
 *     tags: [Standings]
 *     description: Actualiza el leaderboard en tiempo real durante una carrera activa
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Leaderboard'
 *           example:
 *             - driverId: "507f1f77bcf86cd799439011"
 *               driverName: "Max Verstappen"
 *               position: 1
 *               currentLap: 42
 *             - driverId: "507f1f77bcf86cd799439012"
 *               driverName: "Lando Norris"
 *               position: 2
 *               currentLap: 42
 *     responses:
 *       200:
 *         description: Leaderboard actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *       400:
 *         description: Error en la validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/leaderboard', standingsController.updateLeaderboard);

/**
 * @swagger
 * /standings/telemetry/{driverId}:
 *   get:
 *     summary: Obtener telemetría de un piloto específico
 *     tags: [Standings]
 *     parameters:
 *       - in: path
 *         name: driverId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del piloto
 *     responses:
 *       200:
 *         description: Datos de telemetría del piloto
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Telemetry'
 *       404:
 *         description: Telemetría no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/telemetry/:driverId', standingsController.getTelemetry);

module.exports = router;

