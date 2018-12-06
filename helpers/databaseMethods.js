var db = require("../models");
var check = require("./routevalidators.js");

var dbMethods = {
    findRecentUserStories: function (userId) {
        return db.Story.findAll({
            where: {
                AuthorId: userId
            },
            limit: 3,
            order: [
                ["updatedAt", "DESC"]
            ]
        }).then(function (dbStory) {
            return dbStory;
        });
    },
    topFiveTags: function () {
        return db.sequelize.query("select tags.id, tags.TagName, COUNT(stories.id) as num_stories from tags left join storytag on storytag.TagId = tags.id left join stories on storytag.StoryId = stories.id where stories.isPublic = 1 and stories.isFinished = 1 group by tags.id order by num_stories desc limit 5;",
            { type: db.Sequelize.QueryTypes.SELECT }).then(function (dbTags) {
                return dbTags;
            });
    },
    allTags: function () {
        return db.sequelize.query("select tags.id, tags.TagName, COUNT(stories.id) as num_stories from tags left join storytag on storytag.TagId = tags.id left join stories on storytag.StoryId = stories.id group by tags.id order by num_stories desc;",
            { type: db.Sequelize.QueryTypes.SELECT }).then(function (dbTags) {
                return dbTags;
            });
    },
    findUser: function (userId) {
        return db.User.findOne({
            where: {
                id: userId
            }
        }).then(function (dbUser) {
            return dbUser;
        });
    },
    findStory: function (storyId) {
        return db.Story.findOne({
            where: {
                id: storyId
            }
        }).then(function (dbStory) {
            return dbStory;
        });
    },
    findFirstPage: function (authorId, storyId) {
        return db.Page.findOne({
            where: {
                AuthorId: authorId,
                StoryId: storyId,
                isStart: true
            }
        }).then(function (dbFirstPage) {
            return dbFirstPage;
        });
    },
    findPageLinks: function (authorId, storyId, fromPageId) {
        return db.Link.findAll({
            where: {
                AuthorId: authorId,
                StoryId: storyId,
                FromPageId: fromPageId
            },
            order: [
                [db.sequelize.fn("length", db.sequelize.col("linkName")), "ASC"]
            ]
        }).then(function (dbLinks) {
            return dbLinks;
        });
    },
    findAllTagsAndStoriesCount: function () {
        return db.Tag.findAll({
            group: ["Tag.id"],
            includeIgnoreAttributes: false,
            include: [{
                model: db.Story,
                where: {
                    isPublic: true,
                    isFinished: true
                }
            }],
            attributes: [
                "id",
                "TagName",
                [db.sequelize.fn("COUNT", db.sequelize.col("stories.id")), "num_stories"],
            ],
            order: [[db.sequelize.fn("COUNT", db.sequelize.col("stories.id")), "DESC"]]
        }).then(function (result) {
            return result;
        });
    },
    findTaggedStories: function (tagId) {
        return db.Tag.findOne({
            where: {
                id: tagId
            },
            include: [{
                model: db.Story,
                where: {
                    isPublic: true,
                    isFinished: true
                },
                include: [{
                    model: db.User, as: "Author"
                }]
            }]
        }).then(function (result) {
            return result;
        });
    },
    findStoryTags: function (storyId) {
        return db.Tag.findAll({
            include: [{
                model: db.Story,
                attributes: [],
                where: {
                    id: storyId
                }
            }],
            attributes: ["id", "tagName"]
        }).then(function (result) {
            return result;
        });
    },
    tagExists: function (tagName) {
        var lowercase = tagName.toLowerCase();
        return db.Tag.findOne({
            where: {
                tagName: db.sequelize.where(db.sequelize.fn("LOWER", db.sequelize.col("tagName")), lowercase)
            }
        }).then(function (result) {
            return result;
        });
    },
    checkUsernames: function (username) {
        return db.User.count({
            where: {
                displayName: username
            }
        }).then(function (count) {
            return count;
        });
    },
    findAllUsers: function () {
        return db.User.findAll().then(function (dbUser) {
            return dbUser;
        });
    },
    findAllUserStories: function (userId) {
        return db.Story.findAll({
            where: {
                AuthorId: userId,
                isPublic: true,
                isFinished: true
            }
        }).then(function (stories) {
            return stories;
        });
    },
    findAllPublicStories: function () {
        return db.Story.findAll({
            where: {
                isPublic: true,
                isFinished: true
            },
            include: [{
                model: db.User,
                as: "Author"
            }],
            order: [["title", "ASC"]]
        }).then(function (stories) {
            return stories;
        });
    },
    publishStory: function (storyId, authorId) {
        //Helper function that will first check if a story can be published,
        //then attempt to update it in the db
        return new Promise(function (resolve, reject) {
            //do the async thing
            check.storyCanBePublished(storyId, authorId).then(
                function (testResults) {
                    console.log("Received test results");
                    //let's see what we got back from the test results, and return info 
                    //about succeeded (or failed)
                    //we SUCCEEDED if we got the story we asked for, it has at least 2 valid pages, and no invalid pages
                    if (testResults[0].id === parseInt(storyId) && testResults[1] > 1 && testResults[2] === 0 && testResults[3] === 0) {
                        //attempt to actually update the story now
                        db.Story.update({isPublic: true},{where: {id: testResults[0].id}}).then(function(updateResults) {
                            if(updateResults) { //if the update worked, we'll resolve with a success!
                                return resolve({ success: true });
                            }
                            else { //otherwise if there was some kind of error, reject with an error
                                return reject(new Error("Generic Error"));
                            }
                        },
                        function(err) { //if there was a db error, reject with an error
                            return reject(err); 
                        }
                        );
                    }
                    else {
                        //otherwise, see what broke and return the appropriate info via an error
                        //note: we are not rejecting these exactly, we are resolving with info about what the user needs to correct (because there could be multiple issues to address)
                        var errorObj = {
                            success: false,
                            storyTooShort: false,
                            unlinkedPages: false,
                            unfinishedPages: false
                        };
                        if(testResults[1]<2) {
                            errorObj.storyTooShort = true;
                        }
                        if(testResults[2]>0) {
                            errorObj.this.unlinkedPages = true;
                        }
                        if(testResults[3]>0) {
                            errorObj.this.unfinishedPages = true;
                        }
                        return resolve(errorObj);
                    }

                },
                function (err) {
                    //or if our publish tests failed, then we just return that error
                    console.log("Failed test results");
                    console.log(err.message);
                    return reject(err);
                }
            );
        });


    }
};

module.exports = dbMethods;