'use strict';

const Sequelize = require('sequelize');
const {sequelize} = require('../db/sequelize');

const Post = sequelize.define('Posts', {
    title: {
      type: Sequelize.TEXT,
      // this stops this column from being blank
      allowNull: false
    },
    content: {
      type: Sequelize.TEXT,
      allowNull: false
    }
  }, {
    tableName: 'posts',
    underscored: true,

    classMethods: {
      associate: function(models) {
        Post.belongsTo(models.Author, {as: 'posts'});
        Post.hasMany(models.Comment, {as: 'comments'});
      }
    },
    instanceMethods: {
      apiRepr: function() {
        return {
          id: this.id,
          title: this.title,
          createdAt: this.created_at,
          content: this.content,
          authorId: this.author_id
        };
      }
    }
  }
);

module.exports = {
  Post
};
