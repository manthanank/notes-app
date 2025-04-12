const isAdmin = (req, res, next) => {
    // Check if user object exists and has admin role
    if (req.user && req.user.roles && req.user.roles.includes('admin')) {
        next();
    } else {
        return res.status(403).json({ message: 'Admin access required' });
    }
};

module.exports = isAdmin;