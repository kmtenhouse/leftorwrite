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
        if (typeof (idToTest) !== "string") {
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
            if(!validators.isvalidid(storyId)) {
                return reject(new Error("Not a valid story id"));
            }
            //since the id format is valid, go ahead and parse the id into an integer...
            var storyToFind = parseInt(storyId);
            //and now search for the story by its id
            db.Story.findById(storyToFind).then(function (storyResult, err) {
                if(err) { //if there's a db error, we immediately reject with the error
                    return reject(err);
                }
                else { //otherwise, we check what we got 
                    if(!storyResult) { //if no results came back, that means the story doesn't exist (boo)
                        return reject(new Error("No story found with that id"));
                    }
                    //otherwise, the story exists, so we can look at its attributes
                    //NOTE: should we make it readable by the person who owns it
                    //(even if it's not public?)
                    if(!storyResult.isPublic) {
                        return reject(new Error("Story is not public"));
                    }
                    //if we made it all the way through, then the story is readable
                    resolve(storyResult);
                }
            });
        });
    }
};

module.exports = validators;