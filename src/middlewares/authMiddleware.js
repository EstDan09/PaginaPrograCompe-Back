const jwt = require("jsonwebtoken");

exports.auth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

    try {
        console.log("Verifying token:", token);
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        if (!decoded) {
            return res.status(401).json({ message: 'Invalid token.' });
        }
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(400).json({ message: 'Invalid token.' });
    }
};