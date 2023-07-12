const Team = require('../models/Team');
const User = require('../models/User');



exports.createTeam = async (req, res) => {
  // Crear el nuevo equipo
  const newTeam = new Team({
    name: req.body.name,
    members: req.body.members
  });

  try {
    // Obtener el UID del usuario desde el token
    const uid = req.user.uid;

    // Buscar al usuario por su UID para obtener su ID de MongoDB
    const user = await User.findOne({ uid });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Asignar el ID de MongoDB del usuario como creador del equipo
    newTeam.creator = user._id;

    // Guardar el equipo en la base de datos
    const savedTeam = await newTeam.save();

    // Añadir el id del equipo al campo 'team' de cada miembro
    for (const memberId of newTeam.members) {
      const user = await User.findById(memberId);
      user.team = newTeam._id;
      await user.save();
    }

    // Enviar la respuesta
    res.json(savedTeam);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Actualizar un equipo
exports.updateTeam = async (req, res) => {
    try {
        console.log(req.body);
        const oldTeam = await Team.findById(req.params.id);

        const updatedTeam = await Team.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );

        if (!updatedTeam) {
            return res.status(404).json({ message: 'Equipo no encontrado' });
        }

        // Identificar usuarios añadidos y eliminados
        const addedMembers = updatedTeam.members.filter(member =>
            !oldTeam.members.map(m => m.toString()).includes(member.toString())
        );
        console.log('addedMembers:', addedMembers);

        const removedMembers = oldTeam.members.filter(member =>
            !updatedTeam.members.map(m => m.toString()).includes(member.toString())
        );
        console.log('removedMembers:', removedMembers);

        // Añadir el equipo a los miembros añadidos
        for (const memberId of addedMembers) {
            const user = await User.findById(memberId);
            user.team = updatedTeam._id;
            await user.save();
        }

        // Eliminar el equipo de los miembros eliminados
        for (const memberId of removedMembers) {
            const user = await User.findById(memberId);
            user.team = null;
            await user.save();
        }

        res.json(updatedTeam);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};



// El resto de los controladores siguen igual...



// Obtener un equipo específico
exports.getTeam = async (req, res) => {
    try {
        const team = await Team.findById(req.params.id);
        if (!team) {
            return res.status(404).json({ message: 'Equipo no encontrado' });
        }
        res.json(team);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Obtener todos los equipos
exports.getTeams = async (req, res) => {
    try {
        const teams = await Team.find();
        res.json(teams);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Eliminar un equipo
exports.deleteTeam = async (req, res) => {
    try {
        // Encontrar el equipo
        const team = await Team.findById(req.params.id);
        if (!team) {
            return res.status(404).json({ message: 'Equipo no encontrado' });
        }

        // Guardar el arreglo de miembros antes de eliminar el equipo
        const members = team.members;

        // Poner a null el campo 'team' de cada miembro
        for (const memberId of members) {
            const user = await User.findById(memberId);
            user.team = null;
            await user.save();
        }

        // Eliminar el equipo de la base de datos
        await team.deleteOne();

        // Enviar la respuesta
        res.json({ message: 'Equipo eliminado con éxito' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};



