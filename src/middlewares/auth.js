const admin = require('firebase-admin');
const environments = require('../config/environments');

// Inicializa la aplicación de administración de Firebase con tu credencial
const serviceAccount = environments.SERVICE_ACCOUNT_KEY;
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    admin.auth().verifyIdToken(token)
      .then((decodedToken) => {
        req.user = decodedToken;
        console.log('Token decodificado:', decodedToken);
        next();
      })
      .catch((err) => {
        console.error(err);
        res.status(401).json({ error: 'Token inválido' });
      });
  } else {
    res.status(401).json({ error: 'Token no proporcionado' });
  }
};

module.exports = authenticate;
