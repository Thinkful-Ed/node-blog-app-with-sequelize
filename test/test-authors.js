const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');

// this makes the should syntax available throughout
// this module
const should = chai.should();

const app = require('../app')
const {Author, Post, Comment} = require('../models');
const {seedTestData, dropTables} = require('./helpers');

chai.use(chaiHttp);

describe('Authors API resource', function() {

  beforeEach(function() {
    return dropTables()
      .then(function() {
        return seedTestData();
      });
  });

  describe('GET single author endpoint', function() {

    it('should return a single author by id', function() {
      let author;
      return Author
        .findOne()
        .then(_author => {
          author = _author
          return chai.request(app)
            .get(`/authors/${author.id}`);
        })
        .then(res => {
          res.should.have.status(200);
          res.body.id.should.equal(author.id);
          res.body.firstName.should.equal(author.firstName);
          res.body.lastName.should.equal(author.lastName);
          res.body.userName.should.equal(author.userName);
        });
    });
  });

  describe('GET author comments endpoint', function() {

    it('should return all comments by an author', function() {
      let author;
      return Author
        .findOne({include: [{model: Comment, as: 'comments'}]})
        .then(_author => {
          author = _author
          return chai.request(app)
            .get(`/authors/${author.id}/comments`);
        })
        .then(res => {
          res.should.have.status(200);
          res.body.comments.length.should.equal(author.comments.length);
          res.body.comments.forEach(function(comment) {
            comment.should.be.a('object');
            comment.should.include.keys('id', 'authorId', 'postId', 'createdAt', 'comment');
          });

          // comment ids should match up with those in database
          author.comments.map(comment => comment.id).should.deep.equal(res.body.comments.map(comment => comment.id));
        });
    });
  });

  describe('GET author posts endpoint', function() {

    it('should return all posts by an author', function() {
      let author;
      return Author
        .findOne({include: [{model: Post, as: 'posts'}]})
        .then(_author => {
          author = _author
          return chai.request(app)
            .get(`/authors/${author.id}/posts`);
        })
        .then(res => {
          res.should.have.status(200);
          res.body.posts.length.should.equal(author.posts.length);
          // post ids should match up
          author.posts.map(post => post.id).should.deep.equal(res.body.posts.map(post => post.id));
        });
    });
  });

  describe('POST an author endpoint', function() {

    it('should add a new author', function() {

      const newAuthorData = {
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        userName: faker.random.word()
      };

      // get an author_id from existing author
      return chai.request(app).post('/authors').send(newAuthorData)
        .then(function(res) {
          res.should.have.status(201);
          res.should.be.json;
          res.body.should.be.a('object');
          res.body.should.include.keys(
            'id', 'firstName', 'lastName', 'userName');
          // cause db should have created id on insertion
          res.body.id.should.not.be.null;
          res.body.firstName.should.equal(newAuthorData.firstName);
          res.body.lastName.should.equal(newAuthorData.lastName);
          res.body.userName.should.equal(newAuthorData.userName);

          return Author.findById(res.body.id);
        })
        .then(function(author) {
          author.firstName.should.equal(newAuthorData.firstName);
          author.lastName.should.equal(newAuthorData.lastName);
          author.userName.should.equal(newAuthorData.userName);
        });
    });
  });

  describe('PUT endpoint', function() {

    it('should update fields you send over', function() {
      const updateData = {
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        userName: faker.random.word()
      };

      return Author
        .findOne()
        .then(function(author) {
          updateData.id = author.id;

          return chai.request(app)
            .put(`/authors/${author.id}`)
            .send(updateData);
        })
        .then(function(res) {
          res.should.have.status(204);
          return Author.findById(updateData.id);
        })
        .then(function(author) {
          author.firstName.should.equal(updateData.firstName);
          author.lastName.should.equal(updateData.lastName);
          author.userName.should.equal(updateData.userName);
        });
      });
  });
});
