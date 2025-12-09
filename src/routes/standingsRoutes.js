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

module.exports = router;

