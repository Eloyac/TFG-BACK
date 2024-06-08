const jwt = require('jsonwebtoken');
const JWT_SECRET = "3c6e0b8a9c15224a8228b9a98ca1531e5a8bda3606729e8cdd14e7b5f3c69f06e8a769f6d9db4e7a5a5db3bcb07a312a3cd9e6d7d7de5f295f1a6e6a1f8a6f7a";

module.exports = function (req, res, next) {
  // Token para la cabezera
  const token = req.header('x-auth-token');
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  // Verificar el token con la clave secreta
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};
