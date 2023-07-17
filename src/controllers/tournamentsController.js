const User = require('../models/User');
const Tournament = require('../models/Tournament');
const Team = require('../models/Team');
const Match = require('../models/Match');
// Importa la función de aleatorización
const { shuffle } = require('./utils');
const sharp = require('sharp');

// ...

exports.createTournament = async (req, res) => {
  const { name, date, time, inscription, prize, location, teamCount } = req.body;
  const { uid } = req.user; // Obtener el UID del usuario autenticado

  try {
    const creator = await User.findOne({ uid });
    if (!creator) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    if (creator.role !== 'administrador') {
      return res.status(403).json({ message: 'Acceso no autorizado' });
    }

    const newTournament = new Tournament({
      name,
      date,
      time,
      inscription,
      prize,
      location,
      teamCount,
      created_by: creator._id // Usar el ID del usuario encontrado
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
  const base64Voucher = req.body.voucher; // Cambiar el nombre del campo a 'voucher'

  try {
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return res.status(404).json({ message: 'Torneo no encontrado' });
    }

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Equipo no encontrado' });
    }

    if (tournament.teams.length >= tournament.teamCount) {
      return res.status(400).json({ message: 'Se ha alcanzado el número máximo de equipos permitidos en el torneo' });
    }

    // Asignar el string base64 directamente al campo 'voucher'
    team.voucher = base64Voucher; // Cambiar el nombre de la variable a 'base64Voucher'

    const teamData = {
      team: teamId,
      state: 'pendiente',
      voucher: base64Voucher
    };

    tournament.teams.push(teamData);
    const updatedTournament = await tournament.save();

    res.json(updatedTournament);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};







exports.startTournament = async (req, res) => {
  const tournamentId = req.params.id;

  try {
    const tournament = await Tournament.findById(tournamentId).populate('teams');
    if (!tournament) {
      return res.status(404).json({ message: 'Torneo no encontrado' });
    }

    // if (tournament.created_by.toString() !== req.user.id) {
    //   return res.status(403).json({ message: 'Acceso no autorizado' });
    // }

    const teams = tournament.teams;
    const totalTeams = teams.length;

    if (totalTeams < 2) {
      return res.status(400).json({ message: 'Se necesitan al menos 2 equipos para iniciar el torneo' });
    }

    // Aleatorizar el orden de los equipos
    const shuffledTeams = shuffle(teams);

    const totalMatches = totalTeams / 2;

    // Generar los partidos de la primera ronda
    const matches = [];

    for (let i = 0; i < totalMatches; i++) {
      const team1 = shuffledTeams[i * 2];
      const team2 = shuffledTeams[i * 2 + 1];

      const match = new Match({
        round: 1, // Primera ronda
        team1,
        team2
      });

      matches.push(match);
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

    // if (tournament.created_by.toString() !== req.user.id) {
    //   return res.status(403).json({ message: 'Acceso no autorizado' });
    // }

    if (tournament.winners.length > 0) {
      return res.status(400).json({ message: 'No se puede editar los partidos si ya hay ganadores' });
    }

    // Recorrer los partidos y actualizar los equipos correspondientes
    for (let i = 0; i < matches.length; i++) {
      const { match, team1, team2 } = matches[i];
      const matchToUpdate = await Match.findById(match);
      
      if (!matchToUpdate) {
        return res.status(404).json({ message: `Partido ${match} no encontrado` });
      }

      matchToUpdate.team1 = team1;
      matchToUpdate.team2 = team2;
      
      await matchToUpdate.save();
    }

    res.json({ message: 'Partidos editados exitosamente' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



exports.registerResult = async (req, res) => {
  const tournamentId = req.params.tournamentId;
  const matchId = req.params.matchId;
  const { teamId, result } = req.body;

  try {
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return res.status(404).json({ message: 'Torneo no encontrado' });
    }

    const match = await Match.findById(matchId);
    if (!match) {
      return res.status(404).json({ message: 'Partido no encontrado' });
    }

    match.result = result;
    const updatedMatch = await match.save();

    // Verificar si ya existe un ganador con el mismo matchId
    const existingWinner = tournament.winners.find(winner => winner.matchId.toString() === matchId);
    if (existingWinner) {
      return res.status(400).json({ message: 'El partido ya tiene un ganador registrado' });
    }

    tournament.winners.push({ matchId, teamId }); // Agregar un nuevo ganador al arreglo

    // Verificar si todos los partidos de la ronda actual tienen un resultado registrado
    const roundMatches = await Match.find({ tournament: tournamentId, round: match.round });
    const isRoundComplete = roundMatches.every(match => !!match.result);

    tournament.isRoundComplete = isRoundComplete;

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
    console.log(tournament)
    if (!tournament) {
      return res.status(404).json({ message: 'Torneo no encontrado' });
    }

    const currentRound = tournament.rounds;
    const roundMatches = await Match.find({ tournament: tournamentId, round: currentRound });
    const isRoundComplete = roundMatches.every(match => !!match.result);

    if (!isRoundComplete) {
      return res.status(400).json({ message: 'La ronda actual no está completa' });
    }

    if (tournament.winners.length === 1 && tournament.isRoundComplete) {
      return res.json({ message: 'El torneo ha concluido', winner: tournament.winners[0].teamId });
    }

    const nextRound = currentRound + 1;

    const team1 = tournament.winners[0].teamId;
    const team2 = tournament.winners[1].teamId;

    const match = new Match({
      round: nextRound,
      team1,
      team2
    });

    const savedMatch = await match.save();

    tournament.matches.push(savedMatch._id);
    tournament.winners = [];
    tournament.isRoundComplete = false;
    tournament.rounds += 1;
    tournament.roundMatches = [savedMatch._id];

    const updatedTournament = await tournament.save();

    res.json(updatedTournament);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getTournaments = async (req, res) => {
  try {
    const tournaments = await Tournament.find();

    const transformedTournaments = tournaments.map(tournament => {
      return {
        ...tournament._doc,
        matches: [],
        roundMatches: [],
        winners: [],
        teams: [] // Agregar también el campo 'teams' vacío si es necesario
      };
    });

    res.json(transformedTournaments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



// Función auxiliar para encontrar el nombre del equipo en el arreglo de teams
const findTeamName = (teams, matchTeam) => {
  if (!matchTeam || !matchTeam._id) {
    return null;
  }

  const team = teams.find(team => team._id.toString() === matchTeam._id.toString());
  return team ? team.team.name : null;
};




exports.getTournament = async (req, res) => {
  const tournamentId = req.params.id;

  try {
    const tournament = await Tournament.findById(tournamentId)
      .populate({
        path: 'teams.team',
        select: 'name'
      })
      .populate({
        path: 'matches',
        select: 'round result team1 team2',
      })
      ;

    if (!tournament) {
      return res.status(404).json({ message: 'Torneo no encontrado' });
    }

    const transformedMatches = tournament.matches.map(match => {
      const team1 = match.team1 ? {
        _id: match.team1 ? match.team1._id : null,
        name: findTeamName(tournament.teams, match.team1)
      } : null;
      const team2 = match.team2 ? {
        _id: match.team2 ? match.team2._id : null,
        name: findTeamName(tournament.teams, match.team2)
      } : null;

      return {
        _id: match._id,
        round: match.round,
        result: match.result,
        team1,
        team2
      };
    });

    const transformedWinners = tournament.winners.map(winner => {
      const team = tournament.teams.find(team => team._id.toString() === winner.teamId.toString());
      return {
        matchId: winner.matchId,
        teamId: winner.teamId,
        teamName: team ? team.team.name : null
      };
    });

    const transformedTournament = {
      ...tournament._doc,
      matches: transformedMatches,
      winners: transformedWinners
    };

    res.json(transformedTournament);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};






  exports.deleteTournament = async (req, res) => {
    const tournamentId = req.params.id;
    const uid = req.user.uid; // Obtener el UID del usuario autenticado
  
    try {
      const tournament = await Tournament.findById(tournamentId);
      if (!tournament) {
        return res.status(404).json({ message: 'Torneo no encontrado' });
      }
  
      const creator = await User.findOne({ uid });
      if (!creator) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
  
      if (tournament.created_by.toString() !== creator._id.toString()) {
        return res.status(403).json({ message: 'Acceso no autorizado' });
      }
  
      // Eliminar los partidos asociados al torneo
      await Match.deleteMany({ tournament: tournamentId });
  
      // Eliminar el torneo
      await Tournament.findByIdAndDelete(tournamentId);
  
      res.json({ message: 'Torneo eliminado exitosamente' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };

  exports.acceptTeam = async (req, res) => {
    const tournamentId = req.params.id;
    const teamId = req.body.teamId;
  
    try {
      const tournament = await Tournament.findById(tournamentId);
      if (!tournament) {
        return res.status(404).json({ message: 'Torneo no encontrado' });
      }
  
      const team = tournament.teams.find(t => t._id.toString() === teamId);
      if (!team) {
        return res.status(404).json({ message: 'Equipo no encontrado en el torneo' });
      }
  
      if (team.state !== 'pendiente') {
        return res.status(400).json({ message: 'El equipo ya ha sido aceptado o rechazado' });
      }
  
      team.state = 'aceptado';
      await tournament.save();
  
      res.json({ message: 'Equipo aceptado exitosamente' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };
  
  exports.rejectTeam = async (req, res) => {
    const tournamentId = req.params.id;
    const teamId = req.body.teamId;
  
    try {
      const tournament = await Tournament.findById(tournamentId);
      if (!tournament) {
        return res.status(404).json({ message: 'Torneo no encontrado' });
      }
  
      const teamIndex = tournament.teams.findIndex(t => t._id.toString() === teamId);
      if (teamIndex === -1) {
        return res.status(404).json({ message: 'Equipo no encontrado en el torneo' });
      }
  
      tournament.teams.splice(teamIndex, 1);
      await tournament.save();
  
      res.json({ message: 'Equipo rechazado exitosamente' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };
  
  
 