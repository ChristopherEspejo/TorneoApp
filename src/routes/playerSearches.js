const express = require('express');
const router = express.Router();
const playerSearchesController = require('../controllers/playerSearchesController');

router.post('/', playerSearchesController.createSearch);
router.get('/', playerSearchesController.getSearches);
router.get('/:id', playerSearchesController.getSearch);
router.put('/:id', playerSearchesController.updateSearch);
router.delete('/:id', playerSearchesController.deleteSearch);
router.post('/:id/register', playerSearchesController.registerToSearch);

module.exports = router;
