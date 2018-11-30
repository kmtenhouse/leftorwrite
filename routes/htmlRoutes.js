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
                db.Tag.findAll({
                    attributes: ["TagName", "id", [db.sequelize.fn("COUNT", "stories.id"), "NumStories"]],
                    includeIgnoreAttributes:false,
                    include: [{
                        model: db.Story, 
                        attributes: [[db.sequelize.fn("COUNT", "stories.id"), "NumStories"]], 
                        duplicating: false
                    }],
                    group: ["id"],
                    order: [[db.sequelize.fn("COUNT", "stories.id"), "DESC"]], 
                    limit: 5
                }).then(function (dbTags) {
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
        res.render("newUser");
    })

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
