var passport = require("passport");
var db = require("../models");

module.exports = function(app){

    // Redirects to Google Sign in Page
    app.get("/auth/google", 
        passport.authenticate("google", { scope: ["https://www.googleapis.com/auth/plus.login"] }));
    
    // Callback URL after sign-in 
    app.get("/auth/google/callback", 
        passport.authenticate("google", {failureRedirect: "/"}),
        function(req, res) {
            var profile = req.user.profile;
            // Finds or creates a new user with the user token id
            db.User.findOrCreate({
                where: {
                    oAuthKey: profile.id
                },
                defaults: {
                    displayName: profile.displayName
                }
            }).spread(function(user, created){
                req.session.token = user.id;
                // If a new user was created, should redirect to a create user's page
                if(created){
                    res.redirect("/newUser");
                }
                // If user already exists, redirect to their page
                else{
                    res.redirect("/");
                }
            });
        }
    );
    
    // Logout URL
    app.get("/logout", function(req, res){
        req.logout();
        req.session = null;
        res.redirect("/");
    });
};