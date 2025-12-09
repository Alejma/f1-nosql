const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');
const { rebuildTeamPointsFromRaces  } = require('../utils/rebuildTeamPointsFromRaces');

/**
 * @swagger
 * /teams:
 *   post:
 *     summary: Crear un nuevo equipo
 *     tags: [Teams]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - country
 *             properties:
 *               name:
 *                 type: string
 *                 example: Red Bull Racing
 *               country:
 *                 type: string
 *                 example: Austria
 *               points:
 *                 type: number
 *                 example: 0
 *     responses:
 *       201:
 *         description: Equipo creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Team'
 *       400:
 *         description: Error en la validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', teamController.createTeam);

/**
 * @swagger
 * /teams:
 *   get:
 *     summary: Obtener todos los equipos
 *     tags: [Teams]
 *     responses:
 *       200:
 *         description: Lista de equipos ordenados por puntos
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
 *                     $ref: '#/components/schemas/Team'
 */
router.get('/', teamController.getAllTeams);

/**
 * @swagger
 * /teams/admin/rebuild-points:
 *   get:
 *     summary: Reconstruye puntos y drivers de equipos desde todas las carreras
 *     tags: [Teams]
 *     responses:
 *       200:
 *         description: Rebuild realizado
 */
router.get('/admin/rebuild-points', async (req, res) => {
  try {
    await rebuildTeamPointsFromRaces();
    res.json({ success: true, message: 'Rebuild de puntos completado' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * @swagger
 * /teams/{id}:
 *   get:
 *     summary: Obtener equipo por ID
 *     tags: [Teams]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del equipo
 *     responses:
 *       200:
 *         description: Datos del equipo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Team'
 *       404:
 *         description: Equipo no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', teamController.getTeamById);

/**
 * @swagger
 * /teams/{id}:
 *   put:
 *     summary: Actualizar equipo
 *     tags: [Teams]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del equipo
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               country:
 *                 type: string
 *               points:
 *                 type: number
 *     responses:
 *       200:
 *         description: Equipo actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Team'
 *                 message:
 *                   type: string
 *       400:
 *         description: Error en la validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:id', teamController.updateTeam);

/**
 * @swagger
 * /teams/{id}:
 *   delete:
 *     summary: Eliminar equipo
 *     tags: [Teams]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del equipo
 *     responses:
 *       200:
 *         description: Equipo eliminado exitosamente
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
 *         description: Equipo no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id', teamController.deleteTeam);



module.exports = router;

