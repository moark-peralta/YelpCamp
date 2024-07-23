const express = require('express')
const router = express.Router()
const passport = require('passport')
const User = require('../models/user')
const catchAsync = require('../utils/catchAsync')
const users = require('../controller/users')


router.route('/register')
    .get((users.renderRegisterForm))
    .post(catchAsync(users.registerUser))

router.route('/login')
    .get((users.renderLoginForm))
    .post( passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}), (users.userLogin))

router.get('/logout', (users.userLogout)); 

module.exports = router
