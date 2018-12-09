"use strict";

module.exports = function (sequelize, DataTypes) {
    var User = sequelize.define("User", {
        oAuthKey: {
            type: DataTypes.STRING,
            allowNull: false
        },
        displayName: {
            type: DataTypes.STRING,
            allowNull: false,
            validtate: {
                len: [3, 50]
            }
        }
    });
    User.associate = function(models) {
        User.hasMany(models.Story), {as: "Stories", foreignKey: "AuthorId"};
        User.hasMany(models.Page), {as: "Pages", foreignKey: "AuthorId"};
        User.hasMany(models.Link), {as: "Links", foreignKey: "AuthorId"};
    };
    return User;
};
