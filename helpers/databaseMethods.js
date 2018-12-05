var db = require("../models");

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
    publishStory: async function (storyId) {
        //Helper function to check if a story is fully valid to be published
        //ASSUMES we have already sanitized the story id and checked for write privs, etc
        //Stories can be published if:
        //1) the story HAS at least 2 valid pages - content finished, not dangling pages, not orphaned
        //(this should be at least 2)
        var minimumValidPages = db.Page.count({
            where: {
                isOrphaned: false,
                isLinked: true,
                contentFinished: true,
                StoryId: storyId
            }
        });

        //2) they have no unlinked ('dangling') pages (that are not orphaned)
        //(this should be 0)
        var countOfUnlinkedPages = db.Page.count({
            where: {
                isOrphaned: false,
                isLinked: false,
                StoryId: storyId
            }
        });

        //3) all the content is 'finished' (that are not orphaned)
        //(this should be 0)
        var countofUnfinishedPages = db.Page.count({
            where: {
                isOrphaned: false,
                contentFinished: false,
                StoryId: storyId
            }
        });

        return Promise.all([minimumValidPages, countOfUnlinkedPages, countofUnfinishedPages]).then(
            function (resultsArray) {
                //now check the results to see if we're updating the story or not
                var resultsObj = {
                    success: false,
                    tooShort: false,
                    unlinkedPages: false,
                    unfinishedPages: false
                };
                //if we have two or more valid pages, and no invalid pages, then we can go ahead and set the story to public!
                if (resultsArray[0] > 1 && resultsArray[1] === 0 && resultsArray[2] === 0) {
                    resultsObj.success = true;
                    return resultsObj;
                }
                //otherwise, we failed - let's be verbose about why
                else {
                  

                    resultsObj.success = false;
                    if (resultsArray[0] < 2) {
                        resultsObj.tooShort = true;
                    }
                    if (resultsArray[1] > 0) {
                        resultsObj.unlinkedPages = true;
                    }
                    if (resultsArray[2] > 0) {
                        resultsObj.unfinishedPages = true;
                    }
                    return resultsObj;
                }

            },
            //if some error occurred, reject the promise
            function (err) {
                return err;
            }
        );
    }
};

module.exports = dbMethods;