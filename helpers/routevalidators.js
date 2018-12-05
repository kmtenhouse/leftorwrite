var db = require("../models");
var validators = {
    //Check if a given id is valid for a story or page
    //Ids are 'valid' when they are positive, non-zero integers
    //NOTE: we could either expect a string OR an integer here
    //It will be VALID if the item CAN successfully be parsed by parseInt
    //We still have to do that parsing 
    isvalidid: function (idToTest) {
        //We expect a string from the front end -- anything else is automatically invalid
        //(For example, objects)
        if ((typeof (idToTest) !== "string") && (typeof (idToTest) !== "number")) {
            return false;
        }
        //now check if the string contains any invalid characters
        //(because javascript parses do dumb things when you start with numbers but end with letters
        var numbersOnly = /^[0-9]*$/;
        if (!idToTest.toString().match(numbersOnly)) {
            return false;
        }
        //now, cast the item to an integer and check the value -- 
        //it needs to be positive and non-zero!
        if (parseInt(idToTest) <= 0) {
            return false;
        }
        //if we passed all these checks, we are good!
        return true;
    },
    storyIsReadable: function (storyId) {
        //Helper function to check if a story is READABLE to readers
        //The story must 1) exist in the db  2) have the 'isPublic' value set to true
        return new Promise(function (resolve, reject) {
            //Do the async job -- in this case look up the story by its id
            //first, we see if it's even a valid id in the first place
            //if not, we immediately reject the promise
            if (!validators.isvalidid(storyId)) {
                return reject(new Error("Invalid Story Id"));
            }
            //since the id format is valid, go ahead and parse the id into an integer...
            var storyToFind = parseInt(storyId);
            //and now search for the story by its id
            db.Story.findOne({where: {id: storyToFind}}).then(function (storyResult, err) {
                if (err) { //if there's a db error, we immediately reject with the error
                    return reject(err);
                }
                else { //otherwise, we check what we got 
                    if (!storyResult) { //if no results came back, that means the story doesn't exist (boo)
                        return reject(new Error("Story Not Found"));
                    }
                    //otherwise, the story exists, so we can look at its attributes
                    //NOTE: should we make it readable by the person who owns it
                    //(even if it's not public?)
                    if (!storyResult.isPublic) {
                        return reject(new Error("Story Not Public"));
                    }
                    //if we made it all the way through, then the story is readable
                    resolve(storyResult);
                }
            });
        });
    },
    storyIsWriteable: function (storyId, authorId) {
        //takes in the ID of a story as well as an author id (from the session token) 
        //and checks to see if the current user has permissions to write to that story
        return new Promise(function (resolve, reject) {
            //first, let's check that the storyId and authorId are remotely valid
            //if not, we immediately reject the promise
            if (!validators.isvalidid(storyId)) {
                return reject(new Error("Invalid Story Id"));
            }
            if (!validators.isvalidid(authorId)) {
                return reject(new Error("Invalid Author Id"));
            }
            //since the ids are reasonable, we now perform a query to find this story 
            //since the id format is valid, go ahead and parse the id into an integer...
            var storyToFind = parseInt(storyId);
            db.Story.findOne({where: {id: storyToFind}}).then(function (storyResult, err) {
                if (err) { //if there's some kind of error, reject the promise
                    return reject(err);
                }
                //otherwise, see if we got a result...
                if (!storyResult) {
                    return reject(new Error("Story Not Found"));
                }
                //otherwise, look at the result that was returned...
                //if this particular author did not write it, we are not letting them edit
                if (storyResult.AuthorId !== authorId) {
                    return reject(new Error("Story Permission Denied"));
                }
                //otherwise the result is that we can write to this story!
                //return the story object
                return resolve(storyResult);
            });
        });
    },
    pageIsReadable: function (pageId, storyId="") {
        //checks if a page is readable
        //pages are publicly readable if the story they belong to is marked public and they are finished, and not orphaned 
        //also accepts an OPTIONAL pageId so that checks can be done to make sure that routes have stories that match their pages correctly
        return new Promise(function (resolve, reject) {
            //first, validate the format of the pageid itself (and storyid, if provided)
            //if it's not valid, reject immediately
            if(storyId) {
                if(!validators.isvalidid(storyId)) {
                    return reject(new Error("Invalid Story Id"));
                }
            }
            if (!validators.isvalidid(pageId)) {
                return reject(new Error("Invalid Page Id"));
            }
            //since it's valid, go ahead and set up our search options
            var pageToFind = parseInt(pageId);
            var whereOptions = {
                id: pageToFind
            };
            if(storyId) {
                var storyToFind = parseInt(storyId);
                whereOptions.StoryId = storyToFind;
            }
            //now look up that page in the db, along with the associated story
            db.Page.findOne({
                where: whereOptions,
                include: [{
                    model: db.Story,
                    as: "Story"
                }]
            }).then(function(pageResult, error) {
                if(error) { //if some kind of error happened, reject the promise
                    return reject(error);
                }
                //otherwise see if we found a page
                if(!pageResult) {
                    return reject(new Error("Page Not Found"));
                }
                //now make sure the parent story is public
                if(!pageResult.Story.isPublic) {
                    return reject(new Error("Story Not Public"));
                }
                //now, check if the page is orphaned
                if(pageResult.isOrphaned) {
                    return reject(new Error("Orphaned Page"));
                }
                //lastly, check if the page is unfinished
                if(!pageResult.contentFinished) {
                    return reject(new Error("Page Not Finished"));
                }
                //if we made it through all those checks, we win!
                return resolve(pageResult);
            });
        });
    },
    pageIsWriteable: function(pageId, authorId, storyId="") {
        return new Promise(function (resolve, reject) {
            //first, let's check that the pageId, authorId, and storyId (if provided) are remotely valid
            //if not, we immediately reject the promise
            if (!validators.isvalidid(authorId)) {
                return reject(new Error("Invalid Author Id"));
            }

            if(storyId) { //only run this validation if a story id was provided
                if(!validators.isvalidid(storyId)) {
                    return reject(new Error("Invalid Story Id"));
                }
            }
            if (!validators.isvalidid(pageId)) {
                return reject(new Error("Invalid Page Id"));
            }

            //since it's valid, go ahead and set up our search options
            var pageToFind = parseInt(pageId);
            var whereOptions = {
                id: pageToFind
            };
            if(storyId) {
                var storyToFind = parseInt(storyId);
                whereOptions.StoryId = storyToFind;
            }
            //now look up that page in the db, along with the associated story
            db.Page.findOne({
                where: whereOptions,
                include: [{
                    model: db.Story,
                    as: "Story"
                }]
            }).then(function(pageResult, error) {
                if(error) { //if some kind of error happened, reject the promise
                    return reject(error);
                }
                //otherwise see if we found a page
                if(!pageResult) {
                    return reject(new Error("Page Not Found"));
                }
                //first, make sure the story belongs to this author
                if(pageResult.Story.AuthorId!==authorId) {
                    return reject(new Error("Story Permission Denied"));
                }
                //now make sure the author is the correct author for the page as well
                //(this is forward looking to group edits)
                if(pageResult.AuthorId!==authorId) {
                    return reject(new Error("Page Permission Denied"));
                }
                //if we made it through all those checks, we win!
                return resolve(pageResult);
            });
        });
    }
};

module.exports = validators;