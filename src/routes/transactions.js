const express = require('express');
const router = express.Router();
const transactionsController = require('../controllers/transactionsController');

// Verificar si el tipo de cambio ha variado
router.post('/verify-change', transactionsController.verifyTipoCambio);

// Crear una nueva transacción
router.post('/create-transaction', transactionsController.createTransaction);

// Actualizar una transacción existente (por ejemplo, para agregar número de operación y cambiar estado a pendiente)
router.patch('/:id/update', transactionsController.updateTransaction);

// Cancelar una transacción
router.patch('/:id/cancel', transactionsController.cancelTransaction);

// Obtener todas las transacciones
router.get('/', transactionsController.getAllTransactions);

// Actualizar el estado de una transacción a 'culminado'
router.patch('/:id/complete', transactionsController.completeTransaction);

router.get('/download-report', transactionsController.downloadTransactionsReport);


module.exports = router;


