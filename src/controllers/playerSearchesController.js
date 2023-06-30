const PlayerSearch = require('../models/PlayerSearch');
const User = require('../models/User');

exports.createSearch = async (req, res) => {
  const {
    title,
    position_needed,
    match_date,
    match_time,
    field_rental_payment,
    location,
    address,
    description
  } = req.body;

  // Obtener el UID del usuario del token
  const uid = req.user.uid;

  try {
    // Buscar el usuario por el UID y obtener su ID
    const createdBy = await User.findOne({ uid }).select('_id');

    if (!createdBy) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const newSearch = new PlayerSearch({
      title: title || 'Mi Partido de Futbol',
      position_needed,
      created_by: createdBy._id,
      match_date,
      match_time,
      field_rental_payment,
      location,
      address,
      description
    });

    const savedSearch = await newSearch.save();
    res.json(savedSearch);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getSearches = async (req, res) => {
  try {
    const searches = await PlayerSearch.find().populate('created_by', 'username');
    res.json(searches);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getSearch = async (req, res) => {
  try {
    const search = await PlayerSearch.findById(req.params.id).populate('created_by', 'username');
    if (!search) {
      return res.status(404).json({ message: 'Búsqueda no encontrada' });
    }
    res.json(search);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateSearch = async (req, res) => {
  try {
    const updatedSearch = await PlayerSearch.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    if (!updatedSearch) {
      return res.status(404).json({ message: 'Búsqueda no encontrada' });
    }
    res.json(updatedSearch);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteSearch = async (req, res) => {
  try {
    const search = await PlayerSearch.findByIdAndDelete(req.params.id);
    if (!search) {
      return res.status(404).json({ message: 'Búsqueda no encontrada' });
    }
    res.json({ message: 'Búsqueda eliminada con éxito' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.registerToSearch = async (req, res) => {
  try {
    const search = await PlayerSearch.findById(req.params.id);
    if (!search) {
      return res.status(404).json({ message: 'Búsqueda no encontrada' });
    }

    // Obtener el ID del usuario a partir del token
    const { uid } = req.user;
    
    // Buscar el usuario por el UID en la base de datos
    const user = await User.findOne({ uid });
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Actualizar la búsqueda con el ID del jugador interesado
    search.player_interested = user._id; // Usar el ID del usuario encontrado
    const updatedSearch = await search.save();
    res.json(updatedSearch);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

