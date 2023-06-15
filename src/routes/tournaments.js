const express = require('express');
const router = express.Router();
const tournamentController = require('../controllers/tournamentController');

// Crear un torneo
router.post('/', tournamentController.createTournament);

// Agregar un equipo a un torneo
router.post('/:id/add-team', tournamentController.addTeamToTournament);

// Iniciar un torneo
router.post('/:id/start', tournamentController.startTournament);

// Editar los partidos de un torneo
router.put('/:id/edit-matches', tournamentController.editMatches);

// Registrar el resultado de un partido
router.put('/:tournamentId/matches/:matchId/register-result', tournamentController.registerResult);

// Generar la siguiente ronda del torneo
router.post('/:id/generate-next-round', tournamentController.generateNextRound);

module.exports = router;
