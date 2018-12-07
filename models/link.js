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
        Link.belongsTo(models.User, {as: "Author"});
        Link.belongsTo(models.Story, {as: "Story"});
        Link.belongsTo(models.Page, {as: "FromPage", sourceKey: "id"});
        Link.belongsTo(models.Page, {as: "ToPage", sourceKey: "id"});
    };
    return Link;
};
