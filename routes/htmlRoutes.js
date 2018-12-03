// VARIABLES 
var db = require("../models");
var check = require("../helpers/routevalidators.js");
var getError = require("../helpers/errorhandlers.js");
var dbMethods = require("../helpers/databaseMethods");
// list helper object
var helpList = require("../helpers/helperlists.js");
// helper that sorts which tags are active for the story. 
// Accepts return data for the story and for all tags.
var sort = require("../helpers/sortstorytags.js");

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
            // If they are trying to go to the start page, it will redirect to the main story page
            if(page.isStart){
                return res.redirect("/story/read/" + dbStory.id);
            }
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

    app.get("/tags", function (req, res) {
        var loggedIn = false;
        if(req.session.token){
            loggedIn = true;
        }
        dbMethods.findAllTagsAndStoriesCount().then(function(tags){
            res.render("index", {
                loggedIn: loggedIn,
                seeTags: true,
                tags: tags
            });
        });
    });

    app.get("/tags/:tagid", function (req, res) {
        if (!check.isvalidid(req.params.tagid)) {
            //if this is not a valid tag id, return an error that we can't read the story
            var tagError = new Error("Invalid Tag Id");
            return res.render("404", getError.messageTemplate(tagError));
        }
        //otherwise, go ahead and parse the id and proceed!
        var tagId = parseInt(req.params.tagid);
        var loggedIn = false;
        if(req.session.token){
            loggedIn = true;
        }
        dbMethods.findTaggedStories(tagId).then(function(result){
            if(result === null){
                var tagError = new Error("Invalid Tag Id");
                return res.render("404", getError.messageTemplate(tagError));
            }
            res.render("index", {
                loggedIn: loggedIn,
                seeTaggedStories: true,
                tag: result,
                stories: result.Stories
            });
        });
    });

    //WRITER ROUTES
    //CREATE NEW STORY (SETTINGS)
    //When a writer first creates a new story, we will show them a blank form for their
    //story's settings. Once they 'save' it, we'll create a new db entry if everything is valid :)
    app.get("/story/create", function (req, res) {
        async function create () {
            var tags = await dbMethods.allTags().catch(function(err) {
                console.log(err);
                var storyError = new Error(err.message);
                return res.render("404", getError.messageTemplate(storyError));
            });
            var retObj = {
                tags: tags,
                warn: helpList.warnings,
                storybuttons: helpList.storybuttons
            };
            res.render("story", retObj);
        }
        create();
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
        async function update () {
            var authorID = req.session.token;
            var theStory = await check.storyIsWriteable(storyId, authorID).catch(function(err) {
                console.log(err);
                var storyError = new Error(err.message);
                return res.render("404", getError.messageTemplate(storyError));
            });
            if (theStory) {
                var tags = await dbMethods.allTags().catch(function(err) {
                    console.log(err);
                    var storyError = new Error(err.message);
                    return res.render("404", getError.messageTemplate(storyError));
                });
                var storytags = await theStory.getTags({through: {StoryId: storyId}}).catch(function(err) {
                    console.log(err);
                    var storyError = new Error(err.message);
                    return res.render("404", getError.messageTemplate(storyError));
                });
                var retObj = sort(theStory, storytags, tags);
                console.log(retObj);
                helpList.warningsMatch(theStory.dataValues);
                retObj.warn = helpList.warnings;
                retObj.storybuttons = helpList.storybuttons;
                res.render("story", retObj);
            }
        }
        update();
    });

    //STORY AND PAGE OVERVIEWS
    //For writers: view the full overview of your story in a tree-like way
    app.get("/story/overview/:storyid", function (req, res) {
        //(LONG TERM: will be a tree view)
        //Right now: redirects to the page library
        res.redirect("/story/pagelibrary/"+req.params.storyid);
    });

    //For consistency's sake, let's redirect the user to the overview page
    //if they try to just navigate to "story/write/:storyid" :)
    app.get("/story/write/:storyid", function (req, res) {
        //(LONG TERM: will redirect to the tree view)
        //Right now: redirects to the page library
        res.redirect("/story/pagelibrary/"+req.params.storyid);
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
                    //if we had a successful page lookup, create a handlebars object
                    //note: make sure to include some story info like title and story id
                    var hbsObj = {
                        storyid: storyResult.id,
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
    //Create a new (orphaned) page -- displays a form to add a brand new page to an existing story
    app.get("/story/write/:storyid/pages/", function(req,res) {
        //first, check that the existing story is writeable by whoever is trying to access
        check.storyIsWriteable(req.params.storyid, req.session.token).then(
            function(storyResult) {
                //otherwise, the story exists and the person logged in has permissions to write to it!  we can show them the create form :)

                //the logic we'll need to do is 
                //1) determine if this is the first page in the story (if so, it defaults to the start of the story)
                //2) if not, it will become an orphaned page by default
                //(TO-DO) actually send this object to the 'create page' form ;)
                res.send("Writing a page to story " + storyResult.title);
            }, 
            function(error) {
                //otherwise, send the appropriate 404 page
                res.render("404", getError.messageTemplate(error));
            });
    });

    //Edit an existing page
    app.get("/story/write/:storyid/pages/:pageid", function (req, res) {
        //check if the page is editable
        check.pageIsWriteable(req.params.pageid, req.session.token, req.params.storyid).then(
            function(pageResult){
                //if we got a page, render the write form and populate it with the data we already have
                //(TO-DO)
                res.json(pageResult);
            }, 
            function(err) {
                //if an error occurred with the page load, go ahead and show the user
                res.render("404", getError.messageTemplate(err));
            });
    });

    // Render 404 page for any unmatched routes
    app.get("*", function (req, res) {
        var err = new Error("Generic Error");
        res.render("404", getError.messageTemplate(err));
    });
};
