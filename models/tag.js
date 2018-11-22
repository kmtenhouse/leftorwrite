"use strict";

module.exports = function(sequelize, DataTypes) {
    var Tag = sequelize.define("Tag", {
        tagName: {
            type: DataTypes.STRING,
            allowNull: false,
            validtate: {
                len: [5, 100]
            }
        }
    });
    Tag.associate = function(models) {
        models.Tag.belongsToMany(models.Story, {through: "StoryTag"});
    };
    return Tag;
};