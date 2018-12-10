var db = require("../models");
var check = require("../helpers/routevalidators.js");
var getError = require("../helpers/errorhandlers.js");
var dbMethods = require("../helpers/databaseMethods");

module.exports = function (app) {
    //STORY API
    //Simple API to read one story's details (if it's publicly available)
    app.get("/api/story/:storyid", function (req, res) {
        //check if ONE story is readable
        check.storyIsReadable(req.params.storyid)
            .then(function (result) {
                //if so, send the story's main details as a json object
                res.json(result);
            },
            function (err) {
                //otherwise, if an error occurred, send the appropriate error code
                res.sendStatus(getError.statusCode(err));
            });
    });

    //PAGES API
    //Simple API to get one publicly available page to a story
    app.get("/api/page/:pageid", function (req, res) {
        //check if the page is readable
        check.pageIsReadable(req.params.pageid)
            .then(function (result) {
                //if so, send the page as a json object
                res.json(result);
            },
            function (err) {
                //otherwise, if an error occurred, send the appropriate error code
                res.sendStatus(getError.statusCode(err));
            });
    });

    // get all the pages in a story
    app.get("/api/story/:storyid/allpages", function(req, res){
        check.storyIsWriteable(req.params.storyid, req.session.token)
            .then(function(result){
                dbMethods.findAllPagesInStory(result.AuthorId, result.id).then(function(pages){
                    res.json(pages);
                });
            });
    });

    // create new page
    app.post("/api/page/create", async function(req, res) {
        var page = await dbMethods.createNewPage({
            title: req.body.title,
            content: req.body.content,
            isStart: req.body.isStart,
            isTBC: req.body.isTBC,
            isEnding: req.body.isEnding,
            isLinked: req.body.isLinked,
            isOrphaned: req.body.isOrphaned,
            contentFinished: req.body.contentFinished,
            AuthorId: req.session.token,
            StoryId: req.body.storyid,
        }).catch(function(err) {
            console.log("Error: " + err);
            return alert(err.message);
        });
        if(page){
            var children = JSON.parse(req.body.children);
            if (children) {
                for (var i = 0; i < children.length; i++) {
                    var toId = 0;
                    if (children[i].ToPageId === "blank") {
                        var childpage = await dbMethods.createNewPage({
                            AuthorId: req.session.token,
                            StoryId: req.body.storyid,
                            title: "Default Title",
                            content: "Default Content"
                        });
                        toId = childpage.id;
                        console.log(toId);
                    }
                    else {
                        toId = children[i].ToPageId;
                    }
                    var link = await dbMethods.createNewLink({
                        linkName: children[i].linkName,
                        AuthorId: req.session.token,
                        StoryId: req.body.storyid,
                        FromPageId: page.id,
                        ToPageId: toId
                    }).catch(function(err){
                        console.log("Error: " + err);
                        return alert(err.message);
                    });
                    console.log(link.dataValues);
                }
            }
            console.log("Created new page");
            return res.status(200).send({storyId: page.StoryId, pageId: page.id, authorId: page.AuthorId});
        }
    });

    // update an existing page
    app.put("/api/page/update/:id", async function(req, res) {
        console.log("req.body = ", req.body);
        var pageToUpdate = await check.pageIsWriteable(req.body.pageid, req.session.token, req.body.storyid)
        if (pageToUpdate) {
            pageToUpdate.update({
                title: req.body.title,
                content: req.body.content,
                isStart: req.body.isStart,
                isTBC: req.body.isTBC,
                isEnding: req.body.isEnding,
                isLinked: req.body.isLinked,
                isOrphaned: req.body.isOrphaned,
                contentFinished: req.body.contentFinished
            }).catch(function(err) {
                console.log(err);
                return alert(err.message);
            });
            var children = JSON.parse(req.body.children);
            console.log("children = ", children)
            if (children) {
                var childLinks = [];
                for (var i = 0; i < children.length; i++) {
                    var toId = 0;
                    if (children[i].ToPageId === "blank") {
                        var childpage = await dbMethods.createNewPage({
                            AuthorId: req.session.token,
                            StoryId: req.body.storyid,
                            title: "Default Title",
                            content: "Default Content"
                        });
                        toId = childpage.id;
                    }
                    else {
                        toId = children[i].ToPageId;
                    }
                    var link = await dbMethods.createNewLink({
                        linkName: children[i].linkName,
                        AuthorId: req.session.token,
                        StoryId: req.body.storyid,
                        FromPageId: pageToUpdate.id,
                        ToPageId: toId
                    }).catch(function(err){
                        console.log("Error: " + err);
                        return alert(err.message);
                    });
                    console.log(link);
                    childLinks.push(link);
                }
                pageToUpdate.setChildLinks(childLinks);
            }
            if(childpage){
                return res.status(200).send({storyId: pageToUpdate.StoryId, toPageId: childpage.id});
            }
            else{
                return res.sendStatus(200);
            }
        }
    });

    // Theresa created, not tested yet
    // delete an existing page
    app.delete("/api/page/delete/:id", async function(req, res) {
        if(check.pageIsWriteable(req.body.pageid, req.session.token, req.body.storyid)) {
            var deletedPage = await dbMethods.deletePage(req.body.pageid).catch(function(err) {
                console.log(err);
                return alert(err.message);
            });
            if (deletedPage) {
                return res.sendStatus(200);
            }

        }
    });
    //PUT METHOD - PUBLISH STORY
    //We only call this when we want to validate and publish a story 
    //TO DO - make an UNPUBLISH route for revoking public access to your story
    app.put("/api/story/publish/", function (req, res) {
        dbMethods.publishStory(req.body.storyId, req.session.token).then(function(result) {
            //send info about the result back to the front end
            //NOTE: this will either be a success, or a failure 
            //front end gets to decide what to do with it
            res.json(result); 
        }, function(err) { //trap outright rejections for malformed urls, etc
            res.sendStatus(getError.statusCode(err)); 
        });
    });

    //TAGS API
    //GET ALL TAGS
    //Will deliver all existing tags -- including their id, name, and the # of stories that use them - ordered by how many stories use them
    app.get("/api/tags", function (req, res) {
        db.sequelize.query("select Tags.id, Tags.TagName, COUNT(Stories.id) as num_stories from Tags left join StoryTag on StoryTag.TagId = Tags.id left join Stories on StoryTag.StoryId = Stories.id group by Tags.id order by num_stories desc;", { type: db.Sequelize.QueryTypes.SELECT }).then(function (result) {
            res.send(result);
        });
    });

    app.post("/api/tag/create", async function (req, res) {
        // testRet will be the tag object that matches the search, if one exists.
        // if none exist, it will be null
        var testRet = await dbMethods.tagExists(req.body.tagName).catch(function (err) {
            console.log(err);
        });
        if (testRet === null) {
            db.Tag.create({ tagName: req.body.tagName }).then(function (result) {
                // result will be instance of Tag, a tag object
                return res.status(200).send(result);
            }).catch(function (err) {
                console.log(err);
            });
        }
        else {
            return res.sendStatus(409);
        }
    });

    app.get("/api/user/:username", function (req, res) {
        db.User.findAll({
            where: {
                displayName: req.params.username
            }
        }).then(function (dbUser) {
            res.json(dbUser);
        });
    });

    app.put("/api/user", function (req, res) {
        db.User.update({
            displayName: req.body.username
        }, {
            where: {
                id: req.session.token
            }
        }).then(function (dbUser) {
            if (dbUser === 0) {
                return res.status(404).end();
            }
            else {
                return res.status(200).end();
            }
        });
    });

    // update story info route
    app.put("/api/story/update/:id", async function (req, res) {
        var theStory = await check.storyIsWriteable(req.params.id, req.session.token).catch(function (err) {
            console.log(err);
            return alert(err.message);
        });
        if (theStory) {
            // set this variable in case we need/want to use it in future.
            // this could also be done with a .then.
            var numRows = await db.Story.update({
                title: req.body.title,
                chooseNotToWarn: req.body.chooseNotToWarn,
                violence: req.body.violence,
                nsfw: req.body.nsfw,
                nonConsent: req.body.nsfw,
                characterDeath: req.body.characterDeath,
                profanity: req.body.profanity,
                isPublic: req.body.isPublic,
                isFinished: req.body.isFinished,
                doneByDefault: req.body.doneByDefault
            }, {
                where: { id: req.params.id }
            });
            if (req.body.tags) {
                var tagsArr = req.body.tags.split(",");
                theStory.setTags(tagsArr, { where: { StoryId: req.params.id } }).then(function (dbTag) {
                    if (dbTag === 0) {
                        return res.status(404).end();
                    }
                    else {
                        return res.status(200).end();
                    }
                });
            }
        }
    });
    app.post("/api/story/create/", async function (req, res) {
        console.log("Body: ", req.body);

        var authID = req.session.token;
        var theStory = await db.Story.create({
            title: req.body.title,
            chooseNotToWarn: req.body.chooseNotToWarn,
            violence: req.body.violence,
            nsfw: req.body.nsfw,
            nonConsent: req.body.nsfw,
            characterDeath: req.body.characterDeath,
            profanity: req.body.profanity,
            isPublic: req.body.isPublic,
            isFinished: req.body.isFinished,
            doneByDefault: req.body.doneByDefault
        }).catch(function (err) {
            console.log(err);
            var storyError = new Error(err.message);
            return res.render("404", getError.messageTemplate(storyError));
        });
        theStory.setAuthor(authID).catch(function (err) {
            console.log(err);
            var storyError = new Error(err.message);
            return res.render("404", getError.messageTemplate(storyError));
        });
        if (req.body.tags) {
            var tagsArr = req.body.tags.split(",");
            theStory.setTags(tagsArr, { where: { StoryId: theStory.id } }).catch(function (err) {
                console.log(err);
                var storyError = new Error(err.message);
                return res.render("404", getError.messageTemplate(storyError));
            });
        }
        return res.status(200).send({ id: theStory.id });
    });
    app.delete("/api/story/:id", async function (req, res) {
        // This needs error handling
        var theStory = await check.storyIsWriteable(req.params.id, req.session.token);
        var numLinks = await db.Link.destroy({where: {StoryId: req.params.id}});
        var numPages = await db.Page.destroy({where: {StoryId: req.params.id}});
        console.log("Links: ", numLinks, "Pages", numPages);
        await theStory.destroy();
        return res.sendStatus(200).send(numLinks, numPages);
    });
};