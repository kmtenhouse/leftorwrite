"use strict";

module.exports = function(sequelize, DataTypes) {
    var Page = sequelize.define("Page", {
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        validtate: {
            len: [1, 100]
        }
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
        validtate: {
            len: [1, 5000]
        }
      },
      isTBC: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      isEnding: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      isLinked: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      isOrphaned: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      contentFinished: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      }
    });
    Page.associate = function(models) {
        Page.belongsTo(models.User, {as: "Author"});
        Page.belongsTo(models.Story, {as: "Story"});
    };
    return Page;
  };