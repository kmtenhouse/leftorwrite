var db = require("../models");

module.exports = function (app) {
    // Load index page
    app.get("/", function (req, res) {
        if(req.session.token){
            res.cookie("token", req.session.token);
            db.Story.findAll({
                where: {
                    AuthorId: req.session.token
                },
                limit: 5,
                order: [
                    ["updatedAt", "DESC"]
                ]
            }).then(function(dbStory){
                res.render("index", {
                    loggedIn: true,
                    stories: dbStory
                });
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

    // Load story making/editing page
    app.get("/story/settings/:id", function (req, res) {
        db.Story.findOne({
            where: { id: req.params.id },
            attributes: ["id", "title"]
        }).then(function (dbStory) {
            db.Tag.findAll({
                attributes: ["tagName", "id", [db.sequelize.fn("COUNT", "Stories.id"), "NumStories"]],
                includeIgnoreAttributes:false,
                include: [{
                    model: db.Story, 
                    attributes: ["Stories.id", [db.sequelize.fn("COUNT", "Stories.id"), "NumStories"]], 
                    duplicating: false
                }],
                group: ["id"],
                order: [[db.sequelize.fn("COUNT", "Stories.id"), "DESC"]]
            }).then(function (dbTags) {
                res.render("story", {
                    story: dbStory,
                    tags: dbTags,
                });
            });
        });
    });

    // Render 404 page for any unmatched routes
    app.get("*", function (req, res) {
        res.render("404");
    });
};
