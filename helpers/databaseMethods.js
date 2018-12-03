var db = require("../models");

var dbMethods = {
    findAllUserStories: function(userId){
        return db.Story.findAll({
            where: {
                AuthorId: userId
            },
            limit: 5,
            order: [
                ["updatedAt", "DESC"]
            ]
        }).then(function (dbStory){
            return dbStory;
        });
    },
    topFiveTags: function(){
        return db.sequelize.query("select tags.id, tags.TagName, COUNT(stories.id) as num_stories from tags left join storytag on storytag.TagId = tags.id left join stories on storytag.StoryId = stories.id where stories.isPublic = 1 and stories.isFinished = 1 group by tags.id order by num_stories desc limit 5;", 
            { type: db.Sequelize.QueryTypes.SELECT }).then(function (dbTags) {
            return dbTags;
        });
    },
    allTags: function() {
        return db.sequelize.query("select tags.id, tags.TagName, COUNT(stories.id) as num_stories from tags left join storytag on storytag.TagId = tags.id left join stories on storytag.StoryId = stories.id group by tags.id order by num_stories desc;", 
            { type: db.Sequelize.QueryTypes.SELECT }).then(function (dbTags) {
            return dbTags;
        });
    },
    findUser: function(userId){
        return db.User.findOne({
            where: {
                id: userId
            }
        }).then(function (dbUser) {
            return dbUser;
        });
    },
    findStory: function(storyId){
        return db.Story.findOne({
            where: {
                id: storyId
            }
        }).then(function (dbStory) {
            return dbStory;
        });
    },
    findFirstPage: function(authorId, storyId){
        return db.Page.findOne({
            where: {
                AuthorId: authorId,
                StoryId: storyId,
                isStart: true
            }
        }).then(function(dbFirstPage){
            return dbFirstPage;
        });
    },
    findPageLinks: function(authorId, storyId, fromPageId){
        return db.Link.findAll({
            where: {
                AuthorId: authorId,
                StoryId: storyId,
                FromPageId: fromPageId
            }
        }).then(function(dbLinks){
            return dbLinks;
        });
    },
    findAllTags: function(){
        return db.Tag.findAll({}).then(function(dbTags){
            return dbTags;
        });
    },
    findTaggedStories: function(tagId){
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
        }).then(function(result){
            return result;
        });
    }
};

module.exports = dbMethods;