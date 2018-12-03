module.exports = function (dbStory, storyTags, dbTags) {
    // console.log("dbTags inside sortstory.js = ", dbTags);
    // clean up story object
    var retS = {
        id: dbStory.dataValues.id,
        title: dbStory.dataValues.title,
        isPublic: dbStory.dataValues.isPublic,
        isFinished: dbStory.dataValues.isFinished,
        doneByDefault: dbStory.dataValues.doneByDefault,
        chooseNotToWarn: dbStory.dataValues.chooseNotToWarn,
        violence: dbStory.dataValues.violence,
        nsfw: dbStory.dataValues.nsfw,
        nonConsent: dbStory.dataValues.nonConsent,
        characterDeath: dbStory.dataValues.characterDeath,
        profanity: dbStory.dataValues.profanity,
        createdAt: dbStory.dataValues.createdAt,
        updatedAt: dbStory.dataValues.updatedAt,
        AuthorId: dbStory.dataValues.AuthorId,
    };
    // sort out which tags are active for the story, and return a tags object with that information
    var retT = [];
    var storytags = [];
    for (var i = 0; i < storyTags.length; i++) {
        storytags.push(storyTags[i].dataValues.id);
    }
    for (var j = 0; j < dbTags.length; j++) {
        var tag = dbTags[j];
        for (var k = 0; k < storytags.length; k++) {
            tag.active = storytags.some(function(value) {
                return value === dbTags[j].id;
            });
        }
        retT.push(tag);
    }
    return {
        story: retS, 
        tags: retT
    };
};