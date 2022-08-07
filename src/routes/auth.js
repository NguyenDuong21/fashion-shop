const express = require("express");
const Router = express.Router();
const passport = require('passport');
Router.get('/google', passport.authenticate('google', { scope: ['email', 'profile'] }));
Router.get('/google/callback', passport.authenticate('google', {
    successRedirect: '/handelGoogleRedirectLogin',
    failureRedirect: '/error'
}))
Router.get('/facebook', passport.authenticate('facebook', {
    scope: ['public_profile', 'email']
}));

Router.get('/facebook/callback',
    passport.authenticate('facebook', {
        successRedirect: '/handelFacebookRedirectLogin',
        failureRedirect: '/error'
    }));
module.exports = Router;