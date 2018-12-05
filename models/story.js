"use strict";

module.exports = function (sequelize, DataTypes) {
    var Story = sequelize.define("Story", {
        title: {
            type: DataTypes.STRING,
            allowNull: false,
            validtate: {
                len: [2, 100]
            }
        },
        isPublic: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        isFinished: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        doneByDefault: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        chooseNotToWarn: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        violence: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        nsfw: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        nonConsent: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        characterDeath: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        profanity: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    });
    Story.associate = function(models) {
        Story.belongsTo(models.User, {as: "Author"});
        Story.belongsToMany(models.Tag, {through: "StoryTag"});
        Story.hasMany(models.Page);
    };
    Story.sync();
    return Story;
};