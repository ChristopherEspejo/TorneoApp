const express = require('express');
const router = express.Router();
const tournamentController = require('../controllers/tournamentsController');

// Crear un torneo
router.post('/', tournamentController.createTournament);

// Agregar un equipo a un torneo
router.post('/:id/add-team', tournamentController.addTeamToTournament);

// Aceptar un equipo en un torneo
router.put('/:id/accept-team', tournamentController.acceptTeam);

// Rechazar un equipo en un torneo
router.put('/:id/reject-team', tournamentController.rejectTeam);

// Iniciar un torneo
router.post('/:id/start', tournamentController.startTournament);

// Editar los partidos de un torneo
router.put('/:id/edit-matches', tournamentController.editMatches);

// Registrar el resultado de un partido
router.put('/:tournamentId/matches/:matchId/register-result', tournamentController.registerResult);

// Generar la siguiente ronda del torneo
router.post('/:id/generate-next-round', tournamentController.generateNextRound);

// Obtener todos los torneos creados
router.get('/', tournamentController.getTournaments);

// Obtener un torneo específico
router.get('/:id', tournamentController.getTournament);

// Eliminar un torneo
router.delete('/:id', tournamentController.deleteTournament);

module.exports = router;
