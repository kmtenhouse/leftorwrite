var db = require("../models");
var check = require("../helpers/routevalidators.js");
var getError = require("../helpers/errorhandlers.js");

module.exports = function (app) {
    //STORY API
    //Simple API to read one story's details (if it's publicly available)
    app.get("/api/story/:storyid", function (req, res) {
        //check if ONE story is readable
        check.storyIsReadable(req.params.storyid)
            .then(function(result) {
                //if so, send the story's main details as a json object
                res.json(result);
            }, 
            function(err) { 
                //otherwise, if an error occurred, send the appropriate error code
                res.sendStatus(getError.statusCode(err));   
            });
    });

    //PAGES API
    //Simple API to get one publicly available page to a story
    app.get("/api/page/:pageid", function (req, res) {
        //check if the page is readable
        check.pageIsReadable(req.params.pageid)
            .then(function(result) {
                //if so, send the page as a json object
                res.json(result);
            }, 
            function(err) { 
                //otherwise, if an error occurred, send the appropriate error code
                res.sendStatus(getError.statusCode(err));    
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

    app.put("/api/story/update/:id", async function(req, res) {
        // console.log("Body: ", req.body);
        console.log("Params id: ", req.params.id);
        var theStory = await check.storyIsWriteable(req.params.id, req.session.token).catch(function(err) {
            console.log(err);
            return alert(err.message);
        });
        if (theStory) {
            var numRows = await db.Story.update({
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
                where: {id: req.params.id}
            });
            if (req.body.tags) {
                var tagsArr = req.body.tags.split(",");
                theStory.setTags(tagsArr, {where: {StoryId: req.params.id}}).then(function (dbTag) {
                    if(dbTag === 0) {
                        return res.status(404).end();
                    }
                    else {
                        return res.status(200).end();
                    }
                }); 
            }
        }
    });
    app.post("/api/story/create/", async function(req, res) {
        console.log("Body: ", req.body);
        var authID = req.session.token;
        var theStory = await db.Story.create({
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
        }).catch(function(err) {
            console.log(err);
            var storyError = new Error(err.message);
            return res.render("404", getError.messageTemplate(storyError));
        });
        theStory.setAuthor(authID).catch(function(err) {
            console.log(err);
            var storyError = new Error(err.message);
            return res.render("404", getError.messageTemplate(storyError));
        });
        if (req.body.tags) {
            var tagsArr = req.body.tags.split(",");
            theStory.setTags(tagsArr, {where: {StoryId: theStory.id}}).catch(function(err) {
                console.log(err);
                var storyError = new Error(err.message);
                return res.render("404", getError.messageTemplate(storyError));
            });
        }
        return res.status(200).send({id: theStory.id});
    });
    app.delete("/api/story/:id", async function (req, res) {
        var theStory = await check.storyIsWriteable(req.params.id, req.session.token);
        var numDeletedTagAssoc = await theStory.setTags([]);
        theStory.destroy({ where: { id: req.params.id } }).catch(function(err) {
            console.log("The error returned after delete is ", err);
            var storyError = new Error(err.message);
            return res.render("404", getError.messageTemplate(storyError));
        }).then(function (result) {
            console.log("delete route result = ", result);
            if (result.dataValues.id === parseInt(req.params.id)) {
                console.log("DELETE SUCCEEDED");
                return res.sendStatus(200);
            }
            else {
                var storyError = new Error("Story Not Found");
                return res.status(404).render("404", getError.messageTemplate(storyError)).end();
            }
        });
        
    });
};