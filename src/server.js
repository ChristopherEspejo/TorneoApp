const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');
const morgan = require('morgan');
const dbConfig = require('./config/db.config');
const usersRouter = require('./routes/users');
const changeTypeRouter = require('./routes/changeType');
const transactionsRouter = require('./routes/transactions');
const bankRoutes = require('./routes/banks');
const bodyParser = require('body-parser');
const authenticate = require('./middlewares/auth');

// Habilitar CORS
app.use(cors());

// Middleware para analizar el cuerpo de las solicitudes POST
app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ limit: '5mb', extended: true }));

// Añade el middleware 'authenticate' en las rutas que requieran autenticación
app.use('/api/users', authenticate, usersRouter);
app.use('/api/changetype', changeTypeRouter);
app.use('/api/transactions', authenticate, transactionsRouter);
app.use('/api/banks', authenticate, bankRoutes);

// Manejo de errores
app.use((err, req, res, _) => {
  return res.status(err.statusCode || 500).json({
    status: 'error',
    statusCode: err.statusCode,
    message: err.message,
  });
});

// Rutas no encontradas
app.get('*', (_, res) => {
  res.send({
    status: 'ruta no encontrada',
  });
});

// Conexión a MongoDB y lanzamiento del servidor
mongoose
  .connect(dbConfig.url, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    const port = process.env.PORT || 3000;
    app.listen(port, '0.0.0.0', () => console.log(`Escuchando en el puerto ${port}...`));
    console.log('Conexión a MongoDB exitosa');
  })
  .catch((err) => {
    console.error('No se pudo conectar a MongoDB', err);
  });

// Requerir cron jobs
require('./crons/cancelTransactions');
