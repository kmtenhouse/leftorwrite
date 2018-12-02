var db = require("../models");
var check = require("../helpers/routevalidators.js");

// VARIABLES 
// list helper object
var helpList = require("../public/js/helperlists");

module.exports = function (app) {
    // Load index page
    app.get("/", function (req, res) {
        // Renders the dashboard if a user is signed in
        if (req.session.token) {
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
            }).then(function (dbStory) {
                // Finds the top 5 tags 
                db.sequelize.query("select tags.TagName, COUNT(stories.id) as num_stories from tags left join storytag on storytag.TagId = tags.id left join stories on storytag.StoryId = stories.id group by tags.id order by num_stories desc limit 5;", { type: db.Sequelize.QueryTypes.SELECT }).then(function (dbTags) {
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
    app.get("/newUser", function(req,res){
        if(req.session.token){
            db.User.findOne({
                where: {
                    id: req.session.token
                }
            }).then(function (dbUser) {
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
        if (!check.isvalidid(req.params.storyid)) {
            //if this is not a valid story id, return an error that we can't read the story
            return res.render("404", {
                errorMessage: "Sorry, we can't load that story!",
                url: "/",
                linkDisplay: "← Back To Home"
            });
        }
        //otherwise, go ahead and parse the id and proceed!
        var storyId = parseInt(req.params.storyid);
        db.Story.findOne({
            where: {
                id: storyId
            }
        }).then(function(dbStory){
            if(dbStory.isPublic && dbStory.isFinished){
                db.User.findOne({
                    where: {
                        id: dbStory.AuthorId
                    }
                }).then(function(author){
                    db.Page.findOne({
                        where: {
                            AuthorId: author.id,
                            StoryId: dbStory.id,
                            isStart: true
                        }
                    }).then(function(firstPage){
                        db.Link.findAll({
                            where: {
                                AuthorId: author.id,
                                StoryId: dbStory.id,
                                FromPageId: firstPage.id
                            }
                        }).then(function(dbLinks){                        
                            res.render("index", {
                                loggedIn: false,
                                readStory: true,
                                dbStory,
                                author,
                                firstPage,
                                links: dbLinks
                            });
                        });
                    });
                });
            }
            else{
                res.render("404", {
                    errorMessage: "Sorry, this story is private or not finished yet!",
                    url: "/",
                    linkDisplay: "← Back To Home"
                });
            }
        });
    });

    app.get("/tags/", function (req, res) {
        res.send("Displaying all tags!");
    });

    app.get("/tags/:tagid", function (req, res) {
        if (!check.isvalidid(req.params.tagid)) {
            //if this is not a valid story id, return an error that we can't read the story
            return res.render("tagnotfound");
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
        if (!check.isvalidid(req.params.storyid) || !check.isvalidid(req.params.pageid)) {
            //if the story or page id are not valid, 
            //return an error that we can't read the page
            return res.render("404", {
                errorMessage: "Sorry, we can't load that page!",
                url: "/",
                linkDisplay: "← Back To Home"
            });
        }
        //otherwise, go ahead and parse the id(s) and proceed!
        var storyId = parseInt(req.params.storyid);
        var pageId = parseInt(req.params.pageid);
        db.Story.findOne({
            where: {
                id: storyId
            }
        }).then(function(dbStory){
            if(dbStory.isPublic && dbStory.isFinished){
                db.Page.findOne({
                    where: {
                        id: pageId,
                        StoryId: dbStory.id
                    }
                }).then(function(page){
                    if(page.contentFinished && !page.isOrphaned && page.isLinked){
                        db.User.findOne({
                            where: {
                                id: dbStory.AuthorId
                            }
                        }).then(function(author){
                            db.Link.findAll({
                                where: {
                                    AuthorId: author.id,
                                    StoryId: dbStory.id,
                                    FromPageId: page.id
                                }
                            }).then(function(dbLinks){
                                res.render("index", {
                                    loggedIn: false,
                                    readPage: true,
                                    dbStory,
                                    author,
                                    page,
                                    links: dbLinks
                                });
                            });
                        });
                    }
                    else{
                        return res.render("404", {
                            errorMessage: "Sorry, we can't load that page!",
                            url: "/",
                            linkDisplay: "← Back To Home"
                        });
                    }
                });
            }
            else {
                return res.render("404", {
                    errorMessage: "Sorry, this story is private or not finished yet!",
                    url: "/",
                    linkDisplay: "← Back To Home"
                });
            }
        })
    });

    app.get("/tags/", function (req, res) {
        res.send("Displaying all tags!");
    });  

    app.get("/tags/:tagid", function (req, res) {
        if(!check.isvalidid(req.params.tagid)) {
            //if this is not a valid story id, return an error that we can't read the story
            return res.render("404", {
                errorMessage: "You've wandered too far afield!!",
                url: "/tags",
                linkDisplay: "← View all tags"
            });
        }
        //otherwise, go ahead and parse the id and proceed!
        var tagId = parseInt(req.params.tagid);
        res.send("Displaying all stories with tag #" + tagId);
    });  

    //WRITER ROUTES
    //CREATE NEW STORY (SETTINGS)
    //When a writer first creates a new story, we will show them a blank form for their
    //story's settings. Once they 'save' it, we'll create a new db entry if everything is valid :)
    app.get("/story/create", function(req, res){
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
            return res.render("404", {
                errorMessage: "Sorry, we can't load that story!",
                url: "/",
                linkDisplay: "← Back To Home"
            });
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
                includeIgnoreAttributes:false,
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
            return res.render("404", {
                errorMessage: "Sorry, we can't load that story!",
                url: "/",
                linkDisplay: "← Back To Home"
            });
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
            return res.render("404", {
                errorMessage: "Sorry, we can't load that story!",
                url: "/",
                linkDisplay: "← Back To Home"
            });
        }
        //otherwise, go ahead and parse the id and proceed!
        var storyId = parseInt(req.params.storyid);
        res.send("Redirect to the overview page for consistency's sake - this is story " + storyId);
    });

    app.get("/story/pagelibrary/:storyid", function (req, res) {
        if (!check.isvalidid(req.params.storyid)) {
            //if this is not a valid story id, return an error that we can't read the story
            return res.render("404", {
                errorMessage: "Sorry, we can't load that story!",
                url: "/",
                linkDisplay: "← Back To Home"
            });
        }
        //otherwise, go ahead and parse the id and proceed!
        //var storyId = parseInt(req.params.storyid);
        
        //(TO-DO) check if this story exists 

        //(TO-DO) check if we have privs to it

        //(TO-DO) run the query to grab all pages for this story
        //Then render the page
        var hbsObj = {
            storytitle: "My Story Title",
            storyId: 2,
            pages: [{
                title: "Unfinished but Linked",
                contentFinished: 0,
                isLinked: 1,
                isTBC: 1,
                isOrphaned: 0
            },
            {
                title: "Dangling Page",
                contentFinished: 1,
                isLinked: 0,
                isOrphaned: 0
            },
            {
                title: "Orphaned",
                contentFinished: 1,
                isLinked: 1, 
                isOrphaned: 1
            }]
        };
        res.render("pagelibrary", hbsObj);
    });

    //WRITE PAGES
    app.get("/story/write/:storyid/pages/:pageid", function (req, res) {
        if (!check.isvalidid(req.params.storyid) || !check.isvalidid(req.params.pageid)) {
            //if the story or page id are not valid, 
            //return an error that we can't read the page
            return res.render("404", {
                errorMessage: "Sorry, we can't load that page!",
                url: "/",
                linkDisplay: "← Back To Home"
            });
        }
        //otherwise, go ahead and parse the id(s) and proceed!
        var storyId = parseInt(req.params.storyid);
        var pageId = parseInt(req.params.pageid);
        res.send("Edit form to edit an individual page (#" + pageId + ") in story " + storyId);
    });




    // Render 404 page for any unmatched routes
    app.get("*", function (req, res) {
        res.render("404", {
            errorMessage: "How did you end up here?",
            url: "/",
            linkDisplay: "← Back To Home"
        });
    });
};
