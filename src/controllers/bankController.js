const { CompanyBank, Bank } = require('../models/Bank');

// Controlador para obtener todos los CompanyBanks
exports.getAllCompanyBanks = async (req, res) => {
  try {
    const companyBanks = await CompanyBank.find();
    res.status(200).json(companyBanks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Controlador para obtener todos los Banks
exports.getAllBanks = async (req, res) => {
  try {
    const banks = await Bank.find();
    res.status(200).json(banks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
