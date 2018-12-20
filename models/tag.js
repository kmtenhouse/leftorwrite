"use strict";

module.exports = function(sequelize, DataTypes) {
    var Tag = sequelize.define("Tag", {
        tagName: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [2, 50]
            }
        }
    });
    Tag.associate = function(models) {
        Tag.belongsToMany(models.Story, {through: "StoryTag"});
    };
    return Tag;
};