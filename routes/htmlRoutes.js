var db = require("../models");

module.exports = function (app) {
    //Commenting out this boilerplate for now so we can test the static routes
    // Load index page
    app.get("/test", function (req, res) {
        db.Tag.findAll({
            attributes: ["TagName", [db.sequelize.fn("COUNT", "stories.id"), "Story Count"]],
            group: "TagName",
            include: [{
                model: db.Story, 
                attributes: []
            }],
            order: [[db.sequelize.fn("COUNT", "stories.id"), 'DESC']]    
        }).then(function (dbExamples) {
            res.send(dbExamples);
        });
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
