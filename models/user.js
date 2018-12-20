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
  /*   User.associate = function(models) {
        User.hasMany(models.Story);
        User.hasMany(models.Page);
        User.hasMany(models.Link);
    }; */

    return User;
};
