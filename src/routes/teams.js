const express = require('express');
const router = express.Router();
const teamsController = require('../controllers/teamsController');

router.post('/', teamsController.createTeam);
router.get('/', teamsController.getTeams);
router.get('/:id', teamsController.getTeam);
router.put('/:id', teamsController.updateTeam);
router.delete('/:id', teamsController.deleteTeam);

module.exports = router;
