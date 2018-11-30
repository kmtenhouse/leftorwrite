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
    app.get("/story/edit/:id", function (req, res) {
        db.Story.findOne({
            where: { id: req.params.id },
            attributes: ["title"]
        }).then(function (dbStory) {
            // dbStory.getTags();
            // db.Tag.findAll({
            //     attributes: ["id", "tagName"],
            //     include: [{
            //         model: db.Story,
            //         as: "stories",
            //         through: {
            //             attributes: ["StoryId", "TagId"]
            //         }
            //     }]
            // }).then(function (dbTags) {
            //     console.log("dbStory = ", dbStory.dataValues);
            //     console.log("dbTags = ", dbTags[0].dataValues.stories.length);
            //     res.render("story", {
            //         story: dbStory,
            //         tags: dbTags
            //     });
            // });
            db.Tag.findAll({
                attributes: ["tagName"],
                include: [{
                    model: db.Story,
                    attributes: ["id"],
                    through: {
                        attributes: ["StoryTag.TagId", [db.sequelize.fn("COUNT", db.sequelize.col("StoryTag.TagId")), "tag_count"]],
                        order: ["tag_count"]
                    }
                }]
            }).then(function (dbTags) {
                // console.log(dbTags[0].stories[0].StoryTag._options.attributes);
                // console.log(dbTags.get("tag_count"));
                // var dbCount = dbTags.getTag_count();
                res.send({
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
