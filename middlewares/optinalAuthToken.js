import jwt from 'jsonwebtoken';

export function optionalAuthenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next(); // Ingen token, gå vidare som gäst
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (!err) {
      req.user = user;
    }
    // Vid fel: fortsätt ändå – användaren behandlas som gäst
    next();
  });
}
