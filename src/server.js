const express = require('express');
const mongoose = require('mongoose');
const app = express();
const dbConfig = require('./config/db.config')
const usersRouter = require('./routes/users')
const teamsRouter = require('./routes/teams')
const playerSearchesRouter = require('./routes/playerSearches')
const tournamentsRouter = require('./routes/tournaments')


// Conexión a MongoDB
mongoose.connect(dbConfig.url, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
})
.then(() => console.log('Conexión a MongoDB exitosa'))
.catch(err => console.error('No se pudo conectar a MongoDB', err));

// Middleware para analizar el cuerpo de las solicitudes POST
app.use(express.json());

// Escuchando en el puerto
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Escuchando en el puerto ${port}...`));
app.use('/api/users', usersRouter);
app.use('/api/teams', teamsRouter);
app.use('/api/playerSearches', playerSearchesRouter);
app.use('/api/tournaments',tournamentsRouter)
