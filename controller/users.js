const User = require('../models/user');

module.exports.registerUser = async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        
        req.login(registeredUser, err => {
            if (err) {
                console.log('Error during registration login:', err);
                return next(err);
            }
            console.log('User registered and logged in:', registeredUser);
            console.log('Session after registration login:', req.session);
            req.flash('success', 'Welcome to YelpCamp!');
            res.redirect('/campgrounds');
        });
    } catch (e) {
        console.log('Error during user registration:', e.message);
        req.flash('error', e.message);
        res.redirect('register');
    }
};

module.exports.renderRegisterForm = (req, res) => {
    res.render('users/register');
};

module.exports.renderLoginForm = (req, res) => {
    res.render('users/login');
};

module.exports.userLogin = (req, res) => {
    console.log('User logged in:', req.user);
    console.log('Session after login:', req.session);
    req.flash('success', 'Welcome Back');
    const redirectUrl = req.session.returnTo || '/campgrounds';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
};

module.exports.userLogout = (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            console.log('Error during logout:', err);
            return next(err);
        }
        console.log('User logged out:', req.user);
        console.log('Session after logout:', req.session);
        req.flash('success', 'Successfully Logged Out!');
        res.redirect('/campgrounds');
    });
};
