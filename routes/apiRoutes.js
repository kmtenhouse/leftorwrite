var db = require("../models");

module.exports = function (app) {
    // Get all examples
    app.get("/api/examples", function (req, res) {
        db.Example.findAll({}).then(function (dbExamples) {
            res.json(dbExamples);
        });
    });

    // Create a new example
    app.post("/api/examples", function (req, res) {
        db.Example.create(req.body).then(function (dbExample) {
            res.json(dbExample);
        });
    });

    // Delete an example by id
    app.delete("/api/examples/:id", function (req, res) {
        db.Example.destroy({ where: { id: req.params.id } }).then(function (dbExample) {
            res.json(dbExample);
        });
    });

    //TAGS API
    //GET ALL TAGS
    app.get("/api/tags", function (req, res) {
        db.Tag.findAll({
            attributes: ["TagName", [db.sequelize.fn("COUNT", "stories.id"), "NumStories"]],
            includeIgnoreAttributes:false,
            include: [{
                model: db.Story, 
                attributes: [[db.sequelize.fn("COUNT", "stories.id"), "NumStories"]], 
                duplicating: false
            }],
            group: ["id"],
            order: [[db.sequelize.fn("COUNT", "stories.id"), "DESC"]], 
        }).then(function (dbExamples) {
            res.send(dbExamples);
        });
    }); 

    //Limit tags (TEST)
    app.get("/api/toptags", function (req, res) {
        db.Tag.findAll({
            attributes: ["TagName", [db.sequelize.fn("COUNT", "stories.id"), 'DESC']],
            include: [{
                model: db.Story, 
                attributes: [], 
                duplicating: false,
            }],
            group: ['TagName'],
            order: [[db.sequelize.fn("COUNT", "stories.id"), 'DESC']], 
            limit: 5   
        }).then(function (dbExamples) {
            res.send(dbExamples);
        });
    }); 

    //DIRECT QUERY METHOD (TEST)
    app.get("/api/directags", function (req, res) {
        db.sequelize.query("select tags.TagName, COUNT(stories.id) as num_stories from tags left join storytag on storytag.TagId = tags.id left join stories on storytag.StoryId = stories.id group by tags.id order by num_stories desc;", { type: db.Sequelize.QueryTypes.SELECT}).then(function(result) {
            res.send(result);
        });
    }); 

    app.put("/api/user", function(req, res){
        db.User.update({
            displayName: req.body.username
        }, {
            where: {
                id: req.session.token
            }
        }).then(function(dbUser){
            if(dbUser === 0){
                return res.status(404).end();
            }
            else{
                return res.status(200).end();
            }
        });
    });
};
