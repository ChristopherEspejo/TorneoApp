const express = require('express');
const router = express.Router();
const bankController = require('../controllers/bankController');

// Ruta para obtener todos los CompanyBanks
router.get('/companyBanks', bankController.getAllCompanyBanks);

// Ruta para obtener todos los Banks
router.get('/banks', bankController.getAllBanks);

module.exports = router;
