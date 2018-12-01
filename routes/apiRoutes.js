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
    //Will deliver all existing tags -- including their id, name, and the # of stories that use them - ordered by how many stories use them
    app.get("/api/tags", function (req, res) {
        db.sequelize.query("select tags.id, tags.TagName, COUNT(stories.id) as num_stories from tags left join storytag on storytag.TagId = tags.id left join stories on storytag.StoryId = stories.id group by tags.id order by num_stories desc;", { type: db.Sequelize.QueryTypes.SELECT}).then(function(result) {
            res.send(result);
        });
    }); 

    app.get("/api/user/:username", function(req, res){
        db.User.findAll({
            where: {
                displayName: req.params.username
            }
        }).then(function(dbUser){
            res.json(dbUser);
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

    app.put("/api/story/update/:id", function(req, res) {
        db.Story.update({
            title: req.body.title,
            chooseNotToWarn: req.body.chooseNotToWarn ,
            violence: req.body.violence,
            nsfw: req.body.nsfw,
            nonConsent: req.body.nsfw,
            characterDeath: req.body.characterDeath,
            profanity: req.body.profanity,
            isPublic: req.body.isPublic,
            isFinished: req.body.isFinished,
            doneByDefault: req.body.doneByDefault
        }, {
            where: {
                id: req.params.id
            }
        }).then(function(dbStory) {
            if(dbStory === 0){
                return res.status(404).end();
            }
            else{
                return res.status(200).end();
            }
        });
    });
};