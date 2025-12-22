exports.auth = (req, res, next) => {
    const role = req.user.role;
    if (role !== 'coach' && role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Coachesonly.' });
    }
    next();
}