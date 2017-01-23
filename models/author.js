'use strict';

const Sequelize = require('sequelize');
const {sequelize} = require('../db/sequelize');

const Author = sequelize.define('Authors', {
    firstName: Sequelize.TEXT,
    lastName: Sequelize.TEXT,
    userName: {
      type: Sequelize.TEXT,
      allowNull: false
    }
  }, {
    tableName: 'authors',
    underscored: true,

    classMethods: {
      associate: function(models) {
        Author.hasMany(models.Post, {as: 'posts', onDelete: 'SET NULL'});
        Author.hasMany(models.Comment, {
          as: 'comments',
          foreignKey: { allowNull: false },
          onDelete: 'CASCADE'
        });
      }
    },
    instanceMethods: {
      apiRepr: function() {
        return {
          id: this.id,
          firstName: this.firstName,
          lastName: this.lastName,
          userName: this.userName
        };
      }
    }
  }
);

module.exports = {
  Author
};
