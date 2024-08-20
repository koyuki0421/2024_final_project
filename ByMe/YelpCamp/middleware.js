module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        // .isAuthenticated是一種方法，檢查是否有登入
        req.session.returnTo = req.originalUrl
        req.flash('error', 'You must be signed in first!');
        return res.redirect('/login');
    }
    next();
}

// 確認是否有登入login的中間件