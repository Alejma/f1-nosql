const express = require('express');
const router = express.Router();
const driverController = require('../controllers/driverController');

/**
 * @swagger
 * /drivers:
 *   post:
 *     summary: Crear un nuevo piloto
 *     tags: [Drivers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - number
 *               - nationality
 *               - teamId
 *             properties:
 *               name:
 *                 type: string
 *                 example: Max Verstappen
 *               number:
 *                 type: number
 *                 example: 33
 *               nationality:
 *                 type: string
 *                 example: Dutch
 *               teamId:
 *                 type: string
 *                 example: 507f1f77bcf86cd799439012
 *               points:
 *                 type: number
 *                 example: 0
 *               currentPosition:
 *                 type: number
 *                 example: 0
 *     responses:
 *       201:
 *         description: Piloto creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Error en la validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', driverController.createDriver);

/**
 * @swagger
 * /drivers:
 *   get:
 *     summary: Obtener todos los pilotos
 *     tags: [Drivers]
 *     responses:
 *       200:
 *         description: Lista de pilotos ordenados por puntos
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
 *                     $ref: '#/components/schemas/Driver'
 */
router.get('/', driverController.getAllDrivers);

/**
 * @swagger
 * /drivers/{id}:
 *   get:
 *     summary: Obtener piloto por ID
 *     tags: [Drivers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del piloto
 *     responses:
 *       200:
 *         description: Datos del piloto
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Driver'
 *       404:
 *         description: Piloto no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', driverController.getDriverById);

/**
 * @swagger
 * /drivers/{id}:
 *   put:
 *     summary: Actualizar piloto
 *     tags: [Drivers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del piloto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               number:
 *                 type: number
 *               nationality:
 *                 type: string
 *               teamId:
 *                 type: string
 *               points:
 *                 type: number
 *               currentPosition:
 *                 type: number
 *     responses:
 *       200:
 *         description: Piloto actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Driver'
 *                 message:
 *                   type: string
 *       400:
 *         description: Error en la validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:id', driverController.updateDriver);

/**
 * @swagger
 * /drivers/{id}:
 *   delete:
 *     summary: Eliminar piloto
 *     tags: [Drivers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del piloto
 *     responses:
 *       200:
 *         description: Piloto eliminado exitosamente
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
 *         description: Piloto no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id', driverController.deleteDriver);

module.exports = router;

