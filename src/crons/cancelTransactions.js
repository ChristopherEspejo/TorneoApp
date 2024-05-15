// crons/cancelTransactions.js
const Transaction = require('../models/Transaction');
const cron = require('node-cron');

async function cancelPendingTransactions() {
  const twentyMinutesAgo = new Date(new Date() - 30 * 60000);
  const transactions = await Transaction.find({
    estado: 'espera',
    createdAt: { $lt: twentyMinutesAgo }
  });

  transactions.forEach(async (transaction) => {
    transaction.estado = 'cancelado';
    await transaction.save();
    console.log(`Transacción ${transaction._id} ha sido cancelada automáticamente.`);
  });
}

// Programar la tarea para que se ejecute cada 5 minutos como ejemplo
cron.schedule('*/9 * * * *', cancelPendingTransactions);
