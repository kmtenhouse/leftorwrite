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
        return db.sequelize.query("select Tags.id, Tags.TagName, COUNT(Stories.id) as num_stories from Tags left join StoryTag on StoryTag.TagId = Tags.id left join Stories on StoryTag.StoryId = Stories.id where Stories.isPublic = 1 and Stories.isFinished = 1 group by Tags.id order by num_stories desc limit 5;",
            { type: db.Sequelize.QueryTypes.SELECT }).then(
                function (dbTags) {
                    return dbTags;
                });
    },
    allTags: function () {
        return db.sequelize.query("select Tags.id, Tags.TagName, COUNT(Stories.id) as num_stories from Tags left join StoryTag on StoryTag.TagId = Tags.id left join Stories on StoryTag.StoryId = Stories.id group by Tags.id order by num_stories desc;",
            { type: db.Sequelize.QueryTypes.SELECT }).then(
                function (dbTags) {
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
    findAllPagesInStory: function (authorId, storyId) {
        return db.Page.findAll({
            where: {
                AuthorId: authorId,
                StoryId: storyId
            },
            attributes: ["id", "title"],
            order: [["isOrphaned", "DESC"]]
        }).then(function (allPages) {
            return allPages;
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
    // Theresa added, not tested yet.
    findPageParent: function (authorId, storyId, toPageId) {
        return db.Link.findAll({
            where: {
                AuthorId: authorId,
                StoryId: storyId,
                ToPageId: toPageId
            }
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
                [db.sequelize.fn("COUNT", db.sequelize.col("Stories.id")), "num_stories"],
            ],
            order: [[db.sequelize.fn("COUNT", db.sequelize.col("Stories.id")), "DESC"]]
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
    createNewPage: function (pageObj) {
        return db.Page.create(pageObj).then(function (newPage) {
            return newPage;
        });
    },
    createMultiplePages: function (pageObjArray) {
        return db.Page.bulkCreate(pageObjArray).then(function (newPages) {
            var newPagesId = [];
            for (var i = 0; i < newPages.length; i++) {
                var id = newPages[i].id;
                newPagesId.push(id);
            }
            return newPagesId;
        });
    },
    // Theresa created, not tested yet
    updatePage: function (pageObj, pageid) {
        return db.Page.update({
            title: pageObj.title,
            content: pageObj.content,
            isStart: pageObj.isStart,
            isTBC: pageObj.isTBC,
            isEnding: pageObj.isEnding,
            isLinked: pageObj.isLinked,
            isOrphaned: pageObj.isOrphaned,
            contentFinished: pageObj.contentFinished
        }, {
                where: {
                    id: pageid
                }
            });
    },
    // Theresa created, not tested yet
    deletePage: function (pageid) {
        return db.Page.destroy({
            where: {
                id: pageid
            }
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
                    //let's see what we got back from the test results, and return info 
                    //about succeeded (or failed)
                    //we SUCCEEDED if the story we asked for is writeable and it doesn't have any invalid pages
                    if (testResults[0].id === parseInt(storyId) && testResults[1] === 0 && testResults[2] === 0 && testResults[3]===1) {
                        //attempt to actually update the story now
                        db.Story.update({ isPublic: true, isFinished: true }, { where: { id: testResults[0].id } }).then(function (updateResults) {
                            if (updateResults) { //if the update worked, we'll resolve with a success!
                                return resolve({ success: true });
                            }
                            else { //otherwise if there was some kind of error, reject with an error
                                return reject(new Error("Generic Error"));
                            }
                        },
                            function (err) { //if there was a db error, reject with an error
                                return reject(err);
                            }
                        );
                    }
                    else {
                        //otherwise, see what broke and return the appropriate info via an error
                        //note: we are not rejecting these exactly, we are resolving with info about what the user needs to correct (because there could be multiple issues to address)
                        var errorObj = {
                            success: false,
                            errors: []
                        };
                        if (testResults[1] > 0) {
                            errorObj.errors.push("Unlinked pages");
                        }
                        if (testResults[2] > 0) {
                            errorObj.errors.push("Unfinished pages");
                        }
                        if (testResults[3] !== 1) {
                            errorObj.errors.push("No start page");
                        }
                        return resolve(errorObj); //note: we are RESOLVING this because we do actually want the front-end to get feedback
                    }

                },
                function (err) {
                    //or if our publish tests failed, then we just return that error
                    return reject(err);
                }
            );
        });
    },
    //function to UNPUBLISH a story from the db
    //only requires that the owner has write access
    unpublishStory: function (storyId, authorId) {
        return new Promise(function (resolve, reject) {
            check.storyIsWriteable(storyId, authorId).then(
                function (storyResult) {
                    //if the story is writeable we'll go ahead and try to update it
                    db.Story.update({ isPublic: false, isFinished: false }, { where: { id: storyResult.id } }).then(
                        function (updateResult) {
                            return resolve({ success: true }); //hooray, we succeeded!
                        });
                },
                function (err) {
                    return reject(err); //otherwise, we did not succeed
                }
            );
        });
    },
    createNewLink: function (linkObj) {
        return db.Link.create(linkObj).then(function (newLink) {
            return newLink;
        });
    },
    createMultipleLinks: function (linkObjArray) {
        return db.Link.bulkCreate(linkObjArray).then(function (newLinks) {
            return newLinks;
        });
    }
};

module.exports = dbMethods;