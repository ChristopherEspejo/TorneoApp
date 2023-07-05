const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');

router.post('/', usersController.createUser);
router.get('/', usersController.getUsers);
router.get('/profile/:userId',usersController.getUserData)
router.get('/:id', usersController.getUser);
router.put('/:id', usersController.updateUser);
router.delete('/:id', usersController.deleteUser);
router.post('/send-message', usersController.sendMessage);
router.get('/chats', usersController.getUserChats);


module.exports = router;
