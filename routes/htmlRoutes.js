var db = require("../models");
var path = require("path");

module.exports = function (app) {
    //Commenting out this boilerplate for now so we can test the static routes
    // Load index page
    app.get("/", function (req, res) {
        res.render("index");
    }); 

    // Load example page and pass in an example by id
    app.get("/example/:id", function (req, res) {
        db.Example.findOne({ where: { id: req.params.id } }).then(function (dbExample) {
            res.render("example", {
                example: dbExample
            });
        });
    });

    app.get("/dashboard", function (req, res) {
        res.sendFile(path.join(__dirname, "../public/dashboard.html"));
    });

    // Render 404 page for any unmatched routes
    app.get("*", function (req, res) {
        res.render("404");
    });
};
