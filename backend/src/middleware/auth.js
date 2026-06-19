const jwt = require('jsonwebtoken');

// Reject a missing, weak, or placeholder secret at boot. A short/known signing
// key lets anyone forge a valid token for any { id, schoolId, role } (including
// role:'admin'), bypassing auth and school isolation — so presence alone is not
// enough; the value must be strong and not the shipped .env.example placeholder.
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET.length < 32 || JWT_SECRET === 'your_jwt_secret_key_here') {
  throw new Error('JWT_SECRET must be set to a strong (>=32 char) non-placeholder value');
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
