const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');
const morgan = require('morgan');
const dbConfig = require('./config/db.config');
const usersRouter = require('./routes/users');
const teamsRouter = require('./routes/teams');
const playerSearchesRouter = require('./routes/playerSearches');
const tournamentsRouter = require('./routes/tournaments');
const admin = require('firebase-admin');

// Habilitar CORS
app.use(cors());
// Middleware para analizar el cuerpo de las solicitudes POST
app.use(express.json());

// Inicializa la aplicación de administración de Firebase con tu credencial
const serviceAccount = require('../serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Middleware para validar el token en las solicitudes
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    admin.auth().verifyIdToken(token)
      .then((decodedToken) => {
        // La firma es válida, puedes acceder a los datos decodificados en 'decodedToken'
        req.user = decodedToken;
        console.log('Token decodificado:', decodedToken); // imprimir token decodificado
        next();
      })
      .catch((err) => {
        // La firma no es válida, maneja el error
        console.error(err);
        res.status(401).json({ error: 'Token inválido' });
      });
  } else {
    res.status(401).json({ error: 'Token no proporcionado' });
  }
};


// Escuchando en el puerto
const port = process.env.PORT || 3000;

// Añade el middleware 'authenticate' en las rutas que requieran autenticación
app.use('/api/teams', authenticate, teamsRouter);
app.use('/api/users', authenticate, usersRouter);
app.use('/api/teams', authenticate, teamsRouter);
app.use('/api/playerSearches', authenticate, playerSearchesRouter);
app.use('/api/tournaments',authenticate, tournamentsRouter);
app.use(
  (err, req, res, _) => {
    return res.status(err.statusCode || 500).json({
      status: "error",
      statusCode: err.statusCode,
      message: err.message,
    });
  }
);
app.get("*", (_, res) => {
  //res.sendFile(path.resolve(__dirname, "public/index.html"));
  res.send('Hello World');
});

// Middleware para imprimir contenido descifrado del token en la consola
app.use((req, res, next) => {
  console.log('Contenido del token descifrado:', req.user);
  next();
});

mongoose.connect(dbConfig.url, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    app.listen(port , "0.0.0.0", () => console.log(`Escuchando en el puerto ${port}...`));
    console.log('Conexión a MongoDB exitosa');
  })
  .catch(err => {
    console.error('No se pudo conectar a MongoDB', err);
  });
