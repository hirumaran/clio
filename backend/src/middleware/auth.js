const jwt = require('jsonwebtoken');

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

/**
 * Verify JWT token and attach user info to req.user
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] }, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    // Normalize claim shape — JWT signs { id, schoolId, role } but legacy
    // controllers may still read req.user.userId. Set both for compat.
    req.user = decoded;
    req.user.id = decoded.id;
    req.user.userId = decoded.id;
    next();
  });
}

module.exports = { authenticateToken };
