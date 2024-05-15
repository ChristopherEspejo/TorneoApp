const express = require('express');
const router = express.Router();
const changeTypeController = require('../controllers/changeTypeController');
const authenticate = require('../middlewares/auth');


// Obtener el tipo de cambio actual
router.get('/change-type', changeTypeController.getChangeType);

// Crear el tipo de cambio inicial (si no existe)
router.post('/change-type', authenticate, changeTypeController.createChangeType);

// Actualizar el tipo de cambio existente
router.patch('/change-type', authenticate , changeTypeController.updateChangeType);

module.exports = router;
