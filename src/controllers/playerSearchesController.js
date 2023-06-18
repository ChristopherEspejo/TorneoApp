const PlayerSearch = require('../models/PlayerSearch');
const User = require('../models/User');

exports.createSearch = async (req, res) => {
  const {
    position_needed,
    created_by,
    match_date,
    match_time,
    field_rental_payment,
    location,
    address,
    description
  } = req.body;

  const newSearch = new PlayerSearch({
    position_needed,
    created_by,
    match_date,
    match_time,
    field_rental_payment,
    location,
    address,
    description
  });

  try {
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

    const user = await User.findById(req.body.userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Actualizar la búsqueda con el ID del jugador
    search.player_interested = req.body.userId;
    const updatedSearch = await search.save();
    res.json(updatedSearch);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
