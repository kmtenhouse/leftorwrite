"use strict";

module.exports = function(sequelize, DataTypes) {
    var Link = sequelize.define("Link", {
        linkName: {
            type: DataTypes.STRING,
            allowNull: false,
            validtate: {
                len: [1, 100]
            }
        }
    });
    Link.associate = function(models) {
        models.Link.belongsTo(models.User, {as: "Author"});
        models.Link.belongsTo(models.Story, {as: "Story"});
        models.Link.belongsTo(models.Page, {as: "FromPage"});
        models.Link.belongsTo(models.Page, {as: "ToPage"});
    };
    return Link;
};
