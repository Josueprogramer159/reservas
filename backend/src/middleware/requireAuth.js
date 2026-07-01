export const requireUserAuth = (req, res, next) => {
  if (!req.session.userId || req.session.role !== 'user') {
    return res.status(401).json({ success: false, message: 'Debes iniciar sesión para acceder a este recurso' });
  }
  next();
};

export const requireAdminAuth = (req, res, next) => {
  if (!req.session.adminId || req.session.role !== 'admin') {
    return res.status(401).json({ success: false, message: 'Acceso restringido a administradores' });
  }
  next();
};
