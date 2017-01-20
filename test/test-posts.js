const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');

// this makes the should syntax available throughout
// this module
const should = chai.should();

const app = require('../app')
const {Author, Post, Comment} = require('../models');
const {seedTestData, dropTables, buildPost} = require('./helpers');

chai.use(chaiHttp);

describe('Posts API resource', function() {

  beforeEach(function() {
    return dropTables()
      .then(function() {
        return seedTestData();
      });
  });

  describe('GET endpoint', function() {

    it('should return all existing posts', function() {

      let res;

      return chai.request(app)
        .get('/posts')
        .then(function(_res) {
          res = _res;
          res.should.have.status(200);
          // otherwise our db seeding didn't work
          res.body.posts.should.have.length.of.at.least(1);
          return Post.count();
        })
        .then(function(count) {
          res.body.posts.should.have.length.of(count);
        });
    });

    it('should return a single post by id', function() {
      let post;
      return Post
        .findOne()
        .then(_post => {
          post = _post
          return chai.request(app)
            .get(`/posts/${post.id}`);
        })
        .then(res => {
          res.should.have.status(200);
          res.body.id.should.equal(post.id);
        })
    });

    it('should return posts with right fields', function() {

      let resPost;
      return chai.request(app)
        .get('/posts')
        .then(function(res) {
          res.should.have.status(200);
          res.should.be.json;
          res.body.posts.should.be.a('array');
          res.body.posts.should.have.length.of.at.least(1);

          res.body.posts.forEach(function(post) {
            post.should.be.a('object');
            post.should.include.keys('id', 'title', 'content', 'authorId', 'createdAt');
          });
          resPost = res.body.posts[0];
          return Post.findById(resPost.id);
        })
        .then(function(post) {

          resPost.id.should.equal(post.id);
          resPost.title.should.equal(post.title);
          resPost.content.should.equal(post.content);
          resPost.createdAt.should.exist;
          resPost.authorId.should.equal(post.author_id);
      });
    });
  });

  describe('POST endpoint', function() {
    // strategy: make a POST request with data,
    // then prove that the post we get back has
    // right keys, and that `id` is there (which means
    // the data was inserted into db)
    it('should add a new post', function() {

      const data = buildPost();

      return Author.findOne()
        .then(function(author) {
          data.authorId = author.id;

          return chai.request(app).post('/posts').send(data);
        })
        .then(function(res) {
          res.should.have.status(201);
          res.should.be.json;
          res.body.should.be.a('object');
          res.body.should.include.keys(
            'id', 'title', 'content', 'authorId', 'createdAt');
          // cause db should have created id on insertion
          res.body.id.should.not.be.null;
          res.body.title.should.equal(data.title);
          res.body.content.should.equal(data.content);

          return Post.findById(res.body.id);
        })
        .then(function(post) {
          post.title.should.equal(data.title);
          post.content.should.equal(data.content);
          post.author_id.should.equal(data.authorId);
        });
    });
  });

  describe('PUT endpoint', function() {

    it('should update fields you send over', function() {
      const updateData = {
        title: '10 amazing things about things',
        content: faker.lorem.paragraphs(4)
      };

      return Post
        .findOne()
        .then(function(post) {
          updateData.id = post.id;

          return chai.request(app)
            .put(`/posts/${post.id}`)
            .send(updateData);
        })
        .then(function(res) {
          res.should.have.status(204);
          return Post.findById(updateData.id);
        })
        .then(function(post) {
          post.title.should.equal(updateData.title);
          post.content.should.equal(updateData.content);
        });
      });
  });

  describe('DELETE endpoint', function() {
    it('delete a post by id', function() {

      let post;

      return Post
        .findOne()
        .then(function(_post) {
          post = _post;
          return chai.request(app).delete(`/posts/${post.id}`);
        })
        .then(function(res) {
          res.should.have.status(204);
          return Post.findById(post.id);
        })
        .then(function(_post) {
          should.not.exist(_post);
        });
    });
  });

  describe('GET comments on a post endpoint', function() {

    it('should return all comments on a post', function() {
      let post;

      return Post
        .findOne({include: [{model: Comment, as: 'comments'}]})
        .then(_post => {
          post = _post;
          return chai.request(app)
            .get(`/posts/${post.id}/comments`);
        })
        .then(function(res) {
          res.should.have.status(200);
          res.body.comments.length.should.equal(post.comments.length);
          res.body.comments.forEach(function(comment) {
            comment.should.be.a('object');
            comment.should.include.keys('id', 'authorId', 'postId', 'createdAt', 'comment');
          });
          // comment ids should match up
          post.comments.map(comment => comment.id).should.deep.equal(res.body.comments.map(comment => comment.id))
        });
    });
  });
});
