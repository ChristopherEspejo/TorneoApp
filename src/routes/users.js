const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');

router.post('/login', usersController.login);
router.post('/register', usersController.register);
router.get('/profile', usersController.profile);
router.put('/update', usersController.updateUser); // Nueva ruta para actualizar usuario

module.exports = router;
