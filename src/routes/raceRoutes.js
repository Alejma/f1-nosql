const express = require('express');
const router = express.Router();
const raceController = require('../controllers/raceController');

/**
 * @swagger
 * /races:
 *   post:
 *     summary: Registrar una nueva carrera
 *     tags: [Races]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - circuit
 *               - date
 *             properties:
 *               name:
 *                 type: string
 *                 example: Gran Premio de Mónaco
 *               circuit:
 *                 type: string
 *                 example: Circuit de Monaco
 *               date:
 *                 type: string
 *                 format: date-time
 *                 example: 2025-05-25T14:00:00Z
 *               results:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     driverId:
 *                       type: string
 *                       example: 507f1f77bcf86cd799439011
 *                     position:
 *                       type: number
 *                       example: 1
 *                     points:
 *                       type: number
 *                       example: 25
 *     responses:
 *       201:
 *         description: Carrera registrada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Race'
 *                 message:
 *                   type: string
 *       400:
 *         description: Error en la validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', raceController.createRace);

/**
 * @swagger
 * /races:
 *   get:
 *     summary: Obtener todas las carreras
 *     tags: [Races]
 *     responses:
 *       200:
 *         description: Lista de carreras ordenadas por fecha
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: number
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Race'
 */
router.get('/', raceController.getAllRaces);

/**
 * @swagger
 * /races/{id}:
 *   get:
 *     summary: Obtener carrera por ID
 *     tags: [Races]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la carrera
 *     responses:
 *       200:
 *         description: Datos de la carrera
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Race'
 *       404:
 *         description: Carrera no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', raceController.getRaceById);

/**
 * @swagger
 * /races/{id}:
 *   put:
 *     summary: Actualizar carrera
 *     tags: [Races]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la carrera
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               circuit:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *               results:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       200:
 *         description: Carrera actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Race'
 *                 message:
 *                   type: string
 *       400:
 *         description: Error en la validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:id', raceController.updateRace);

/**
 * @swagger
 * /races/{id}:
 *   delete:
 *     summary: Eliminar carrera
 *     tags: [Races]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la carrera
 *     responses:
 *       200:
 *         description: Carrera eliminada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *       404:
 *         description: Carrera no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id', raceController.deleteRace);

module.exports = router;

