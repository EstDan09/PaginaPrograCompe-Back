exports.auth = (req, res, next) => {
    const role = req.user.role;
    if (role !== 'student') {
        return res.status(403).json({ message: 'Access denied. Students only.' });
    }
    next();
}