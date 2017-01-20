'use strict';

// we need the Sequelize library in order to
// get the different data types for model properties
// (for instance, `Sequelize.string`).
const Sequelize = require('sequelize');
// we should only have one sequelize instance in our
// whole app, which we can import here and other model
// files.
const {sequelize} = require('../db/sequelize');


const Comment = sequelize.define('Comments', {
    comment: {
      type: Sequelize.TEXT,
      allowNull: false
    }
  }, {
    tableName: 'comments',
    underscored: true,

    classMethods: {
      associate: function(models) {
        Comment.belongsTo(models.Author, {
          foreignKey: { allowNull: false },
          onDelete: 'CASCADE'
        });
        Comment.belongsTo(models.Post, {
          foreignKey: {allowNull: false},
          onDelete: 'CASCADE'
        })
      }
    },
    instanceMethods: {
      apiRepr: function() {
        return {
          id: this.id,
          comment: this.comment,
          createdAt: this.created_at,
          authorId: this.author_id,
          postId: this.post_id
        };
      }
    }
  }
);

module.exports = {
  Comment
};
