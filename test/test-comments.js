const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');

// this makes the should syntax available throughout
// this module
const should = chai.should();

const app = require('../app')
const {Author, Post, Comment} = require('../models');
const {buildAuthor, seedTestData, dropTables} = require('./helpers');

chai.use(chaiHttp);


describe('Comments API resource', function() {

  beforeEach(function() {
    return dropTables()
      .then(function() {
        return seedTestData();
      });
  });

  describe('POST endpoint', function() {

    it('should add a new comment', function() {

      const newCommentData = {
        comment: faker.lorem.words(8)
      };

      // get `authorId` and `postId`
      return Author.findOne({include: [{model: Post, as: 'posts'}]})
        .then(function(author) {
          newCommentData.authorId = author.id;
          newCommentData.postId = author.posts[0].id;
          return chai.request(app).post('/comments').send(newCommentData);
        })
        .then(function(res) {
          res.should.have.status(201);
          res.should.be.json;
          res.body.should.be.a('object');
          res.body.should.include.keys(
            'id', 'comment', 'postId', 'authorId', 'createdAt');
          // cause db should have created id on insertion
          res.body.id.should.not.be.null;
          res.body.comment.should.equal(newCommentData.comment);
          res.body.authorId.should.equal(newCommentData.authorId);
          res.body.postId.should.equal(newCommentData.postId);

          return Comment.findById(res.body.id);
        })
        .then(function(comment) {
          comment.comment.should.equal(newCommentData.comment);
          comment.author_id.should.equal(newCommentData.authorId);
          comment.post_id.should.equal(newCommentData.postId);
        });
    });
  });

  describe('PUT endpoint', function() {

    it('should update a comment', function() {
      const data = {comment:  faker.lorem.paragraphs(4)};

      return Comment
        .findOne()
        .then(function(comment) {
          data.id = comment.id;

          return chai.request(app)
            .put(`/comments/${comment.id}`)
            .send(data);
        })
        .then(function(res) {
          res.should.have.status(204);
          return Comment.findById(data.id);
        })
        .then(function(comment) {
          comment.comment.should.equal(data.comment);
        });
      });
  });

  describe('DELETE endpoint', function() {
    it('should delete a comment by id', function() {

      let comment;

      return Comment
        .findOne()
        .then(function(_comment) {
          comment = _comment;
          return chai.request(app).delete(`/comments/${comment.id}`);
        })
        .then(function(res) {
          res.should.have.status(204);
          return Comment.findById(comment.id);
        })
        .then(function(_comment) {
          should.not.exist(_comment);
        });
    });
  });

});
