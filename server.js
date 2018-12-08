require("dotenv").config();
var express = require("express");
var exphbs = require("express-handlebars");
var passport = require("passport");
var cookieParser = require("cookie-parser");
var cookieSession = require("cookie-session");

var db = require("./models");
var auth = require("./config/auth");

var app = express();
var PORT = process.env.PORT || 3000;

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static("public"));

// Handlebars
app.engine(
    "handlebars",
    exphbs({
        defaultLayout: "main",
        helpers: {
            checkWarnings: function(a,b,c,d,e,f){
                if(!a && !b && !c && !d && !e && !f){
                    return true;
                }
                return false;
            },
            greaterThanZero: function(number){
                if(number > 0){
                    return true;
                }
                return false;
            },
            equalsOne: function(number){
                if(number === 1){
                    return true;
                }
                return false;
            },
            equals: function(a, b){
                if(a === b){
                    return true;
                }
                return false;
            }
        }
    })
);
app.set("view engine", "handlebars");

// Passport
auth(passport);
app.use(passport.initialize());

// Cookies
app.use(cookieSession({
    name: "session",
    keys: [process.env.SESSION_KEY]
}));
app.use(cookieParser());

// Routes
require("./routes/apiRoutes")(app);
require("./routes/authRoutes")(app);
require("./routes/htmlRoutes")(app);

var syncOptions = { force: false };

// If running a test, set syncOptions.force to true
// clearing the `testdb`
if (process.env.NODE_ENV === "test") {
    syncOptions.force = true;
}

// Starting the server, syncing our models ------------------------------------/
db.sequelize.sync(syncOptions).then(function () {
    app.listen(PORT, function () {
        console.log(
            "==> 🌎  Listening on port %s. Visit http://localhost:%s/ in your browser.",
            PORT,
            PORT
        );
    });
});

module.exports = app;


