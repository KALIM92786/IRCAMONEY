module.exports = (req, res, next) => {
  if (!req.userData || !req.userData.isAdmin) {
    return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }
  next();
};