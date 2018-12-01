var db = require("../models");
var check = require("../helpers/routevalidators.js");

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
        if(req.session.token){
            db.User.findOne({
                where: {
                    id: req.session.token
                }
            }).then(function(dbUser){
                res.render("newUser", {
                    user: dbUser
                });
            });
        }
        else{
            res.redirect("/");
        }
    });

    // Load example page and pass in an example by id
    app.get("/example/:id", function (req, res) {
        db.Example.findOne({ where: { id: req.params.id } }).then(function (dbExample) {
            res.render("example", {
                example: dbExample
            });
        });
    //STORY ROUTES 
    //READ routes 
    //Read a story (by storyid)
    //If the story is public and published, it will bring the reader to a 'start' page
    //Start page will include title, author name, and the first page of text + links
    //If the story is not accessible yet, will give an error page
    app.get("/story/read/:storyid", function (req, res) {
        if(!check.isvalidid(req.params.storyid)) {
            //if this is not a valid story id, return an error that we can't read the story
            return res.render("storynotfound");
        }
        //otherwise, go ahead and parse the id and proceed!
        var storyId = parseInt(req.params.storyid);
        res.send("Reading story " + storyId);
    });

    //Read a page (by storyid and pageid)
    //If the story is public and published, and the page is finished and not orphaned,
    //display the content of that page
    //If the story is not accessible yet, will give an error page
    //If the page is orphaned or not finished, will give an error page
    app.get("/story/read/:storyid/page/:pageid", function (req, res) {
        if(!check.isvalidid(req.params.storyid) || !check.isvalidid(req.params.pageid)) {
            //if the story or page id are not valid, 
            //return an error that we can't read the page
            return res.render("pagenotfound");
        }
        //otherwise, go ahead and parse the id(s) and proceed!
        var storyId = parseInt(req.params.storyid);
        var pageId = parseInt(req.params.pageid);
        res.send("Reading page " + pageId + " in story " + storyId);
    });

    //WRITER ROUTES
    //CREATE NEW STORY (SETTINGS)
    //When a writer first creates a new story, we will show them a blank form for their
    //story's settings. Once they 'save' it, we'll create a new db entry if everything is valid :)
    app.get("/story/create", function(req, res){
        res.send("Creating a new page"); //Theresa's form will go here instead :)
    })

    //EDIT STORY (SETTINGS)
    app.get("/story/settings/:storyid", function (req, res) {
        if(!check.isvalidid(req.params.storyid)) {
            //if this is not a valid story id, return an error that we can't read the story
            return res.render("storynotfound");
        }
        //otherwise, go ahead and parse the id and proceed!
        var storyId = parseInt(req.params.storyid);
        //THERESA'S PAGE GOES HERE
        res.send("Edit the title and tags and such for the existing story " + storyId);
    });

    //STORY AND PAGE OVERVIEWS
    //For writers: view the full overview of your story in a tree-like way
    app.get("/story/overview/:storyid", function (req, res) {
        if(!check.isvalidid(req.params.storyid)) {
            //if this is not a valid story id, return an error that we can't read the story
            return res.render("storynotfound");
        }
        //otherwise, go ahead and parse the id and proceed!
        var storyId = parseInt(req.params.storyid);
        res.send("View the story's full overview for story " + storyId);
    });

    //For consistency's sake, let's redirect the user to the overview page
    //if they try to just navigate to "story/write/:storyid" :)
    app.get("/story/write/:storyid", function (req, res) {
        if(!check.isvalidid(req.params.storyid)) {
            //if this is not a valid story id, return an error that we can't read the story
            return res.render("storynotfound");
        }
        //otherwise, go ahead and parse the id and proceed!
        var storyId = parseInt(req.params.storyid);
        res.send("Redirect to the overview page for consistency's sake - this is story " + storyId);
    });

    app.get("/story/pagelibrary/:storyid", function (req, res) {
        if(!check.isvalidid(req.params.storyid)) {
            //if this is not a valid story id, return an error that we can't read the story
            return res.render("storynotfound");
        }
        //otherwise, go ahead and parse the id and proceed!
        var storyId = parseInt(req.params.storyid);
        //(TO-DO) check if this story exists 
        
        //(TO-DO) check if we have privs to it

        //Then render the page
        var hbsObj = {
            storytitle: "My Story Title",
            pages: 
                [{title: "Title 1", content: "Content goes here"}, 
                {title: "Title 2", content: "Content goes here"}]
        };
        res.render("pagelibrary", hbsObj);
    });

    //WRITE PAGES
    app.get("/story/write/:storyid/pages/:pageid", function (req, res) {
        if(!check.isvalidid(req.params.storyid) || !check.isvalidid(req.params.pageid)) {
            //if the story or page id are not valid, 
            //return an error that we can't read the page
            return res.render("pagenotfound");
        }
        //otherwise, go ahead and parse the id(s) and proceed!
        var storyId = parseInt(req.params.storyid);
        var pageId = parseInt(req.params.pageid);
        res.send("Edit form to edit an individual page (#" + pageId + ") in story " + storyId);
    });




    // Render 404 page for any unmatched routes
    app.get("*", function (req, res) {
        res.render("404");
    });
};
