const User = require("../models/schema/user");
const { uuid } = require('uuidv4');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const { hashPassword } = require("../helper/genkey");
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID;
const FACEBOOK_APP_SECRET =  process.env.FACEBOOK_APP_SECRET;
passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});
passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback",
    passReqToCallback: true,
    proxy: true
}, async (request, accessToken, refreshToken, profile, done) => {
    // Check if google profile exist.
    if (profile.id) {
        const existingUser = await User.findOne({ _id: profile.email })
        if (existingUser) {
            done(null, existingUser._id);
        } else {
            const hashedAndSaltedPassword = await hashPassword(uuid());
            let userRegister = await User.findOneAndUpdate({ _id: profile.email, emailVerified: profile.email_verified }, { userName: profile.displayName, hashedAndSaltedPassword },  {
                new: true,
                upsert: true // Make this update into an upsert
              });
            done(null, userRegister._id);
        }
    }
})
);
passport.use(new FacebookStrategy({
    clientID: FACEBOOK_APP_ID,
    clientSecret: FACEBOOK_APP_SECRET,
    callbackURL: '/auth/facebook/callback',
    profileFields: ["email", "name"]
  }, function (accessToken, refreshToken, profile, done) {
    const { email, first_name, last_name } = profile._json;
    console.log({ email, first_name, last_name });
    done(null, email)
  }
));