const express = require('express');
const router = express.Router();
const passport = require('passport');

const { getHashedPassword, randomText } = require('../lib/function');
const { checkUsername, addUser, checkNomor, checkEmail, sendEmail, checkVerify } = require('../place/db');
const { notAuthenticated } = require('../lib/auth');

router.get('/', notAuthenticated, (req, res) => {
    res.render('login', {
    layout: 'login'
  })
})

router.get('/login', notAuthenticated, (req, res) => {
    res.render('login', {
    layout: 'login'
  })
})

router.post('/login', async(req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/docs',
        failureRedirect: '/users/login',
        failureFlash: true,
    })(req, res, next);
});

router.get('/register', notAuthenticated, (req, res) => {
    res.render('register', {
    layout: 'register'
  })
})

router.post('/register', async (req, res) => {
    try {
        let { username, nomorWa, email, password, confirmPassword } = req.body;
        if (username.length < 3) {
            req.flash('error_msg', 'Username must be at least 3 characters');
            res.redirect('/users/register');
        }
        if (password.length < 6 || confirmPassword < 6) {
            req.flash('error_msg', 'Password must be at least 6 characters');
            res.redirect('/users/register');
        }
        if (password === confirmPassword) {
            let checkUser = await checkUsername(username);
            let checkEmails = await checkEmail(email);
            let checkNomors = await checkNomor(nomorWa);
            if (checkUser || checkEmails || checkNomors) {
                req.flash('error_msg', 'A user with the same Account already exists');
                return res.redirect('/users/register');
            } else {
                let hashedPassword = getHashedPassword(password);
                let apikey = randomText(25);
                let id = randomText(200);
                sendEmail(email, id, req.hostname);
                addUser(username, email, hashedPassword, apikey, id, nomorWa);
                req.flash('success_msg', 'Data Has Been Successfully Saved To The Database, Please login with your registered email/username');
                return res.redirect('/users/login');
            }
        } else {
            req.flash('error_msg', 'Password does not match.');
            return res.redirect('/users/register');
        }
    } catch(err) {
        console.log(err);
    }
})

router.get('/logout', (req,res) => {
    req.logout();
    req.flash('success_msg', 'logout success');
    res.redirect('/users/login');
});

module.exports = router;
