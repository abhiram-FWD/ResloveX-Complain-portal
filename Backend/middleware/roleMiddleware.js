const authorityOnly = (req, res, next) => {
  if (req.user && req.user.role === 'authority') return next();
  return res.status(403).json({ success: false, message: 'Authority access required' });
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') return next();
  return res.status(403).json({ success: false, message: 'Admin access required' });
};

const roleMiddleware = (role) => (req, res, next) => {
  if (req.user && req.user.role === role) return next();
  return res.status(403).json({ success: false, message: `${role} access required` });
};

module.exports = { authorityOnly, adminOnly, roleMiddleware };