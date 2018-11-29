var db = require("../models");

module.exports = function (app) {
    //Commenting out this boilerplate for now so we can test the static routes
    // Load index page
    app.get("/", function (req, res) {
        if(req.session.token){
            res.cookie("token", req.session.token);
            res.render("index", {
                loggedIn: true
            });
        }
        else{
            res.cookie("token", "");
            res.render("index", {
                loggedIn: false
            });
        }
    }); 

    // Load example page and pass in an example by id
    app.get("/example/:id", function (req, res) {
        db.Example.findOne({ where: { id: req.params.id } }).then(function (dbExample) {
            res.render("example", {
                example: dbExample
            });
        });
    });

    // Render 404 page for any unmatched routes
    app.get("*", function (req, res) {
        res.render("404");
    });
};
