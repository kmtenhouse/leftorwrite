var db = require("../models");

<<<<<<< HEAD
module.exports = function (app) {
    // Load index page
    app.get("/", function (req, res) {
        db.Example.findAll({}).then(function (dbExamples) {
            res.render("index", {
                msg: "Welcome!",
                examples: dbExamples
            });
        });
    });
=======
module.exports = function(app) {
  //Commenting out this boilerplate for now so we can test the static routes
  // Load index page
  
/*   app.get("/", function(req, res) {

     db.Example.findAll({}).then(function(dbExamples) {
      res.render("index", {
        msg: "Welcome!",
        examples: dbExamples
      });
    }); 
  }); */
>>>>>>> bea2c967fb38c1bd654c6ba3a784c1f6980b571c

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
