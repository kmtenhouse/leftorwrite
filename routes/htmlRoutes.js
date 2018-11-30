var db = require("../models");

module.exports = function (app) {
    // Load index page
    app.get("/", function (req, res) {
        // Renders the dashboard if a user is signed in
        if(req.session.token){
            res.cookie("token", req.session.token);
            // Finds the most recently updated stories of the User
            db.Story.findAll({
                where: {
                    AuthorId: req.session.token
                },
                limit: 5,
                order: [
                    ["updatedAt", "DESC"]
                ]
            }).then(function(dbStory){
                // Finds the top 5 tags 
                db.sequelize.query("select tags.TagName, COUNT(stories.id) as num_stories from tags left join storytag on storytag.TagId = tags.id left join stories on storytag.StoryId = stories.id group by tags.id order by num_stories desc;", { type: db.Sequelize.QueryTypes.SELECT}).then(function(dbTags) {
                    res.render("index", {
                        loggedIn: true,
                        stories: dbStory,
                        tags: dbTags
                    });
                });
            }); 
        }
        // Renders homepage if not signed in
        else{
            res.cookie("token", "");
            res.render("index", {
                loggedIn: false
            });
        }
    }); 

    app.get("/newUser", function(req,res){
        db.User.findOne({
            where: {
                id: req.session.token
            }
        }).then(function(dbUser){
            res.render("newUser", {
                user: dbUser
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

    // Render 404 page for any unmatched routes
    app.get("*", function (req, res) {
        res.render("404");
    });
};
