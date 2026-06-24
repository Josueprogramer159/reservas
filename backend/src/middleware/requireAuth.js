export const requireUserAuth = (req, res, next) => {
  if (!req.session.userId || req.session.role !== 'user') {
    return res.status(401).json({ success: false, message: 'Debes iniciar sesión para acceder a este recurso' });
  }
  next();
};
