var db = require("../models");

module.exports = function (app) {
    //Commenting out this boilerplate for now so we can test the static routes
    // Load index page
    app.get("/", function (req, res) {
        db.Example.findAll({}).then(function (dbExamples) {
            res.render("index", {
                msg: "Welcome!",
                examples: dbExamples
            });
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

    // Load story making/editing page
    app.get("/story/edit/:id", function (req, res) {
        db.Story.findOne({
            where: { id: req.params.id },
            attributes: ["title"]
        }).then(function (dbStory) {
            // dbStory.getTags();
            db.Tag.findAll({
                attributes: ["id", "tagName"],
                include: [{
                    model: db.Story,
                    attributes: ["id"],
                    through: {
                        attributes: ["StoryId", "TagId"]
                    }
                }]
            }).then(function (dbTags) {
                console.log("dbStory = ", dbStory);
                console.log("dbTags = ", dbTags);
                res.render("story", {
                    story: dbStory,
                    tags: dbTags
                });
            });
        });
    });

    // Render 404 page for any unmatched routes
    app.get("*", function (req, res) {
        res.render("404");
    });
};
