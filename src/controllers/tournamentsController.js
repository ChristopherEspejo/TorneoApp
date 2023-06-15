const User = require('../models/User');
const Tournament = require('../models/Tournament');
const Team = require('../models/Team');
const Match = require('../models/Match');

exports.createTournament = async (req, res) => {
  const { name } = req.body;
  const creatorId = req.user.id; // Obtener el ID del usuario autenticado

  try {
    const creator = await User.findById(creatorId);
    if (!creator) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    if (creator.role !== 'administrador') {
      return res.status(403).json({ message: 'Acceso no autorizado' });
    }

    const newTournament = new Tournament({
      name,
      created_by: creatorId
    });

    const savedTournament = await newTournament.save();
    res.json(savedTournament);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addTeamToTournament = async (req, res) => {
  const tournamentId = req.params.id;
  const teamId = req.body.teamId;

  try {
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return res.status(404).json({ message: 'Torneo no encontrado' });
    }

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Equipo no encontrado' });
    }

    /*if (tournament.created_by.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Acceso no autorizado' });
    }*/

    tournament.teams.push(teamId);
    const updatedTournament = await tournament.save();

    res.json(updatedTournament);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Importa la función de aleatorización
const { shuffle } = require('./utils');

// ...

exports.startTournament = async (req, res) => {
  const tournamentId = req.params.id;

  try {
    const tournament = await Tournament.findById(tournamentId).populate('teams');
    if (!tournament) {
      return res.status(404).json({ message: 'Torneo no encontrado' });
    }

    if (tournament.created_by.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Acceso no autorizado' });
    }

    const teams = tournament.teams;
    const totalTeams = teams.length;

    if (totalTeams < 2) {
      return res.status(400).json({ message: 'Se necesitan al menos 2 equipos para iniciar el torneo' });
    }

    // Aleatorizar el orden de los equipos
    const shuffledTeams = shuffle(teams);

    const rounds = Math.ceil(Math.log2(totalTeams));

    // Generar los partidos
    let matches = [];
    let currentRound = 1;
    let matchIndex = 0;

    while (currentRound <= rounds) {
      const totalMatches = Math.pow(2, rounds - currentRound);
      const matchesInRound = [];

      for (let i = 0; i < totalMatches; i++) {
        const team1 = shuffledTeams[matchIndex];
        const team2 = shuffledTeams[matchIndex + 1];

        const match = new Match({
          round: currentRound,
          team1,
          team2
        });

        matchesInRound.push(match);
        matchIndex += 2;
      }

      matches.push(...matchesInRound);
      currentRound++;
    }

    // Guardar los partidos en la base de datos
    const savedMatches = await Match.insertMany(matches);

    // Actualizar el torneo con los IDs de los partidos generados
    tournament.matches = savedMatches.map(match => match._id);
    const updatedTournament = await tournament.save();

    res.json(updatedTournament);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.editMatches = async (req, res) => {
    const tournamentId = req.params.id;
    const { matches } = req.body;
  
    try {
      const tournament = await Tournament.findById(tournamentId);
      if (!tournament) {
        return res.status(404).json({ message: 'Torneo no encontrado' });
      }
  
      if (tournament.created_by.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Acceso no autorizado' });
      }
  
      if (tournament.winners.length > 0) {
        return res.status(400).json({ message: 'No se puede editar los partidos si ya hay ganadores' });
      }
  
      tournament.matches = matches;
      const updatedTournament = await tournament.save();
  
      res.json(updatedTournament);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };

exports.registerResult = async (req, res) => {
    const tournamentId = req.params.tournamentId;
    const matchId = req.params.matchId;
    const { result } = req.body;
  
    try {
      const tournament = await Tournament.findById(tournamentId);
      if (!tournament) {
        return res.status(404).json({ message: 'Torneo no encontrado' });
      }
  
      if (tournament.created_by.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Acceso no autorizado' });
      }
  
      const match = await Match.findById(matchId);
      if (!match) {
        return res.status(404).json({ message: 'Partido no encontrado' });
      }
  
      match.result = result;
      const updatedMatch = await match.save();
  
      // Verificar si todos los partidos de la ronda actual tienen un resultado registrado
      const roundMatches = await Match.find({ tournament: tournamentId, round: match.round });
      const isRoundComplete = roundMatches.every(match => !!match.result);
  
      if (isRoundComplete) {
        tournament.isRoundComplete = true;
      }
  
      const updatedTournament = await tournament.save();
  
      res.json(updatedMatch);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };
  
  exports.generateNextRound = async (req, res) => {
    const tournamentId = req.params.id;
  
    try {
      const tournament = await Tournament.findById(tournamentId).populate('winners');
      if (!tournament) {
        return res.status(404).json({ message: 'Torneo no encontrado' });
      }
  
      if (tournament.created_by.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Acceso no autorizado' });
      }
  
      const currentRound = Math.max(...tournament.winners.map(winner => winner.round));
      const winnersOfCurrentRound = tournament.winners.filter(winner => winner.round === currentRound);
  
      if (winnersOfCurrentRound.length < 2) {
        return res.status(400).json({ message: 'No hay suficientes ganadores para generar la siguiente ronda' });
      }
  
      // Verificar si la ronda actual está completa
      const roundMatches = await Match.find({ tournament: tournamentId, round: currentRound });
      const isRoundComplete = roundMatches.every(match => !!match.result);
  
      if (!isRoundComplete) {
        return res.status(400).json({ message: 'La ronda actual no está completa' });
      }
  
      const nextRound = currentRound + 1;
      const matchesInNextRound = [];
  
      for (let i = 0; i < winnersOfCurrentRound.length; i += 2) {
        const team1 = winnersOfCurrentRound[i].teamId;
        const team2 = winnersOfCurrentRound[i + 1].teamId;
  
        const match = new Match({
          round: nextRound,
          team1,
          team2
        });
  
        matchesInNextRound.push(match);
      }
  
      const savedMatches = await Match.insertMany(matchesInNextRound);
  
      tournament.matches = savedMatches.map(match => match._id);
      const updatedTournament = await tournament.save();
  
      // Reiniciar la variable isRoundComplete a false
      updatedTournament.isRoundComplete = false;
      await updatedTournament.save();
  
      res.json(updatedTournament);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };
  
