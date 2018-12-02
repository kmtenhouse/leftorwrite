var db = require("../models");
var check = require("../helpers/routevalidators.js");
var getError = require("../helpers/errorhandlers.js");
var dbMethods = require("../helpers/databaseMethods");

// VARIABLES 
// list helper object
var helpList = require("../public/js/helperlists");

module.exports = function (app) {
    // Load index page
    app.get("/", function (req, res) {
        // Renders the dashboard if a user is signed in
        if (req.session.token) {
            console.log(req.session.token);
            res.cookie("token", req.session.token);
            // Finds the most recently updated stories of the User
            dbMethods.findAllUserStories(req.session.token).then(function (dbStory) {
                // Finds the top 5 tags 
                dbMethods.topFiveTags().then(function(dbTags){
                    res.render("index", {
                        loggedIn: true,
                        stories: dbStory,
                        tags: dbTags
                    });
                });
            });
        }
        // Renders homepage if not signed in
        else {
            res.cookie("token", "");
            res.render("index", {
                loggedIn: false
            });
        }
    });

    // Loads new user page that allows user to change username
    app.get("/newUser", function (req, res) {
        if (req.session.token) {
            dbMethods.findUser(req.session.token).then(function(dbUser){
                res.render("newUser", {
                    user: dbUser
                });
            });
        }
        else {
            res.redirect("/");
        }
    });

    //STORY ROUTES 
    //READ routes 
    //Read a story (by storyid)
    //If the story is public and published, it will bring the reader to a 'start' page
    //Start page will include title, author name, and the first page of text + links
    //If the story is not accessible yet, will give an error page
    app.get("/story/read/:storyid", function (req, res) {
        var storyId = req.params.storyid;
        var loggedIn = false;
        if(req.session.token){
            loggedIn = true;
        }
        check.storyIsReadable(storyId).then(function(dbStory){
            dbMethods.findUser(dbStory.AuthorId).then(function(author){
                dbMethods.findFirstPage(author.id, storyId).then(function(firstPage){
                    dbMethods.findPageLinks(author.id, storyId, firstPage.id).then(function(links){
                        res.render("index", {
                            loggedIn: loggedIn,
                            readStory: true,
                            dbStory,
                            author,
                            firstPage,
                            links: links
                        });
                    });
                });
            });
        }, function(err){
            res.render("404", getError.messageTemplate(err));
        });
    });

    app.get("/tags", function (req, res) {
        var loggedIn = false;
        if(req.session.token){
            loggedIn = true;
        }
        dbMethods.findAllTags().then(function(tags){
            res.render("index", {
                loggedIn: loggedIn,
                seeTags: true,
                tags: tags
            });
        });
    });

    app.get("/tags/:tagid", function (req, res) {
        if (!check.isvalidid(req.params.tagid)) {
            //if this is not a valid story id, return an error that we can't read the story
            var err = {
                message: "Invalid Tag Id"
            };
            return res.render("404", getError.messageTemplate(err));
        }
        //otherwise, go ahead and parse the id and proceed!
        var tagId = parseInt(req.params.tagid);
        res.send("Displaying all stories with tag #" + tagId);
    });

    //Read a page (by storyid and pageid)
    //If the story is public and published, and the page is finished and not orphaned,
    //display the content of that page
    //If the story is not accessible yet, will give an error page
    //If the page is orphaned or not finished, will give an error page
    app.get("/story/read/:storyid/page/:pageid", function (req, res) {
        var pageId = req.params.pageid;
        var loggedIn = false;
        if(req.session.token){
            loggedIn = true;
        }
        check.pageIsReadable(pageId).then(function(page){
            var dbStory = page.Story;
            dbMethods.findUser(dbStory.AuthorId).then(function(author){
                dbMethods.findPageLinks(author.id, dbStory.id, page.id).then(function(links){
                    res.render("index", {
                        loggedIn: loggedIn,
                        readPage: true,
                        dbStory,
                        author,
                        page,
                        links: links
                    });
                });
            });
        }, function(err){
            res.render("404", getError.messageTemplate(err));
        });
    });

    app.get("/tags/", function (req, res) {
        res.send("Displaying all tags!");
    });

    app.get("/tags/:tagid", function (req, res) {
        if (!check.isvalidid(req.params.tagid)) {
            //if this is not a valid tag id, return an error that we can't read the story
            var tagError = new Error("Invalid Tag Id");
            return res.render("404", getError.messageTemplate(tagError));
        }
        //otherwise, go ahead and parse the id and proceed!
        var tagId = parseInt(req.params.tagid);
        res.send("Displaying all stories with tag #" + tagId);
    });

    //WRITER ROUTES
    //CREATE NEW STORY (SETTINGS)
    //When a writer first creates a new story, we will show them a blank form for their
    //story's settings. Once they 'save' it, we'll create a new db entry if everything is valid :)
    app.get("/story/create", function (req, res) {
        db.Tag.findAll({
            attributes: ["tagName", "id", [db.sequelize.fn("COUNT", "Stories.id"), "NumStories"]],
            includeIgnoreAttributes: false,
            include: [{
                model: db.Story,
                attributes: ["Stories.id", [db.sequelize.fn("COUNT", "Stories.id"), "NumStories"]],
                duplicating: false
            }],
            group: ["id"],
            order: [[db.sequelize.fn("COUNT", "Stories.id"), "DESC"]]
        }).then(function (dbTags) {
            res.render("story", {
                tags: dbTags,
                warn: helpList.warnings,
                storybuttons: helpList.storybuttons
            });
        });
    });

    //EDIT STORY (SETTINGS)
    app.get("/story/settings/:storyid", function (req, res) {
        if (!check.isvalidid(req.params.storyid)) {
            //if this is not a valid story id, return an error that we can't read the story
            var storyError = new Error("Invalid Story Id");
            return res.render("404", getError.messageTemplate(storyError));
        }
        //otherwise, go ahead and parse the id and proceed!
        var storyId = parseInt(req.params.storyid);
        //THERESA'S PAGE GOES HERE
        db.Story.findOne({
            where: { id: storyId },
            include: {
                model: db.Tag,
                attributes: ["id", "tagName"]
            }
        }).then(function (dbStory) {
            db.Tag.findAll({
                attributes: ["id", "tagName", [db.sequelize.fn("COUNT", "Stories.id"), "NumStories"]],
                includeIgnoreAttributes: false,
                include: [{
                    model: db.Story,
                    attributes: ["Stories.id", [db.sequelize.fn("COUNT", "Stories.id"), "NumStories"]],
                    duplicating: false
                }],
                group: ["id"],
                order: [[db.sequelize.fn("COUNT", "Stories.id"), "DESC"]]
            }).then(function (dbTags) {
                // console.log(dbStory.Tags[1].dataValues.tagName);
                // console.log(dbTags);
                helpList.warningsMatch(dbStory.dataValues);
                // console.log(helpList.warnings);
                res.render("story", {
                    story: dbStory,
                    tags: dbTags,
                    warn: helpList.warnings,
                    storybuttons: helpList.storybuttons
                });
            });
        });
    });

    //STORY AND PAGE OVERVIEWS
    //For writers: view the full overview of your story in a tree-like way
    app.get("/story/overview/:storyid", function (req, res) {
        if (!check.isvalidid(req.params.storyid)) {
            //if this is not a valid story id, return an error that we can't read the story
            var storyError = new Error("Invalid Story Id");
            return res.render("404", getError.messageTemplate(storyError));
        }
        //otherwise, go ahead and parse the id and proceed!
        var storyId = parseInt(req.params.storyid);
        res.send("View the story's full overview for story " + storyId);
    });

    //For consistency's sake, let's redirect the user to the overview page
    //if they try to just navigate to "story/write/:storyid" :)
    app.get("/story/write/:storyid", function (req, res) {
        if (!check.isvalidid(req.params.storyid)) {
            //if this is not a valid story id, return an error that we can't read the story
            var storyError = new Error("Invalid Story Id");
            return res.render("404", getError.messageTemplate(storyError));
        }
        //otherwise, go ahead and parse the id and proceed!
        var storyId = parseInt(req.params.storyid);
        res.send("Redirect to the overview page for consistency's sake - this is story " + storyId);
    });

    app.get("/story/pagelibrary/:storyid", function (req, res) {
        //first, check if the token & storyid are legit - then go ahead and load the library
        check.storyIsWriteable(req.params.storyid, req.session.token).
            then(function (storyResult) {
            //Hooray!  this story is legit. Run a query to grab its pages
                var storyToFind = storyResult.id;
                db.Page.findAll({
                    where: {
                        StoryId: storyToFind
                    }
                }).then(function(allpages) {
                    var hbsObj = {
                        title: storyResult.title,
                        pages: allpages
                    };
                    //Now render the page
                    res.render("pagelibrary", hbsObj);
    
                });
            },
            function (err) { //otherwise, if an error occurred: show the right 404 page
                //render a 404 page with whatever info we customized 
                return res.render("404", getError.messageTemplate(err));
            });
    });

    //WRITE PAGES 
    //Create a new page -- displays a form to add a brand new page to an existing story
    app.get("/story/write/:storyid/pages/", function(req,res) {
        //first, check that the existing story is writeable by whoever is trying to access
        check.storyIsWriteable(req.params.storyid, req.session.token).then(
            function(storyResult) {
                //otherwise, the story exists and the person logged in has permissions to write to it!  we can show them the create form :)
                res.send(storyResult); 
                //(TO-DO) actually send this object to the 'create page' form ;)
            }, 
            function(error) {
                //otherwise, send the appropriate 404 page
                res.render("404", getError.messageTemplate(error));
            });
    });

    //Edit page
    app.get("/story/write/:storyid/pages/:pageid", function (req, res) {
        if (!check.isvalidid(req.params.storyid) || !check.isvalidid(req.params.pageid)) {
            //if the story or page id are not valid, 
            //return an error that we can't read the page
            var err = new Error("Invalid Story Id");
            return res.render("404", getError.messageTemplate(err));
        }
        //otherwise, go ahead and parse the id(s) and proceed!
        var storyId = parseInt(req.params.storyid);
        var pageId = parseInt(req.params.pageid);
        res.send("Edit form to edit an individual page (#" + pageId + ") in story " + storyId);
    });

    // Render 404 page for any unmatched routes
    app.get("*", function (req, res) {
        var err = new Error("Generic Error");
        res.render("404", getError.messageTemplate(err));
    });
};
