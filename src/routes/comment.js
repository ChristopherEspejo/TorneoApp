const express = require('express');
const router = express.Router();
const commentsController = require('../controllers/commentController');

// Ruta para crear un nuevo comentario
router.post('/:userId', commentsController.createComment);

// Otras rutas relacionadas con los comentarios...
// ...

module.exports = router;
