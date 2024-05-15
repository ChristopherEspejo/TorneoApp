const ChangeType = require("../models/ChangeType"); // Asegúrate de que el nombre del modelo importado coincida
const User = require("../models/User");

exports.getChangeType = async (req, res) => {
  try {
    const changeType = await ChangeType.findOne(); // Suponiendo que solo habrá un documento
    res.json(changeType);
  } catch (error) {
    res.status(500).send("Error en el servidor");
  }
};

exports.createChangeType = async (req, res) => {
  console.log(req.body);
  try {
    const uid = req.user.uid; // Usas el UID obtenido por tu middleware de autenticación
    const user = await User.findById(uid); // Buscas el usuario en la base de datos para obtener su rol
    if (user.rol !== "admin") {
      return res
        .status(403)
        .json({ message: "No tienes permiso para realizar esta acción" });
    }
    const { tipoCompra, tipoVenta } = req.body;
    const nuevoChangeType = new ChangeType({ tipoCompra, tipoVenta });
    await nuevoChangeType.save();
    res.status(201).json(nuevoChangeType);
  } catch (error) {
    console.error(error); // Cambio aquí para mostrar el error en la consola
    res.status(500).send("Error en el servidor");
  }
};

exports.updateChangeType = async (req, res) => {
  try {
    const uid = req.user.uid; // Usas el UID obtenido por tu middleware de autenticación
    const user = await User.findById(uid); // Buscas el usuario en la base de datos para obtener su rol
    const { tipoCompra, tipoVenta } = req.body;
    const changeType = await ChangeType.findOne(); // Suponiendo que solo habrá un documento

    if (user.rol !== "admin") {
      return res
        .status(403)
        .json({ message: "No tienes permiso para realizar esta acción" });
    }

    if (changeType) {
      // Verifica si cada campo ha sido proporcionado antes de actualizar
      if (tipoCompra !== undefined) {
        changeType.tipoCompra = tipoCompra;
      }
      if (tipoVenta !== undefined) {
        changeType.tipoVenta = tipoVenta;
      }

      changeType.fechaActualizacion = new Date();
      await changeType.save();
      res.json(changeType);
    } else {
      res.status(404).send("Tipo de cambio no encontrado");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Error en el servidor");
  }
};
