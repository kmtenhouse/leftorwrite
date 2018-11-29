var passport = require("passport");
var db = require("../models");

module.exports = function(app){

    // Redirects to Google Sign in Page
    app.get("/auth/google", 
        passport.authenticate("google", { scope: ["https://www.googleapis.com/auth/plus.login"] }));
    
    // Callback URL after sign-in 
    app.get("/auth/google/callback", 
        passport.authenticate("google", {failureRedirect: "/login"}),
        function(req, res) {
            req.session.token = req.user.token;
            var user = req.user.profile;
            // Finds or creates a new user with the user token id
            db.User.findOrCreate({
                where: {
                    oAuthKey: user.id
                },
                defaults: {
                    displayName: user.displayName
                }
            }).spread(function(user, created){
                // If a new user was created, should redirect to a create user's page
                if(created){
                    res.send("User Created");
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