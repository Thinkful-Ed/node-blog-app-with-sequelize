const faker = require('faker');

const {PORT} = require('../config');
const {runServer, closeServer} = require('../server');
const {sequelize} = require('../db/sequelize');
const {Author, Comment, Post} = require('../models');

before(function() {
  return sequelize
    .sync({force: true})
    .then(() => runServer(PORT));
});

after(function() {
    // N.B. `closeServer` both disconnects from the database and
    // stops the server
    return closeServer();
});

function buildAuthor() {
  return {
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    userName: faker.lorem.word(),
  };
}

function buildPost(authorId) {
  const properties = {
    title: faker.lorem.words(10),
    content: faker.lorem.paragraph(8)
  };
  if (authorId) {
    properties.author_id = authorId;
  }
  return properties;
}

function buildComment(authorId, postId) {
  const properties = {
    comment: faker.lorem.words(20)
  };
  if (authorId) {
    properties.author_id = authorId;
  }
  if (postId) {
    properties.post_id = postId;
  }
  return properties;
}

function dropTables() {
  return Promise.all([
    Comment.truncate(),
    Post.truncate({cascade: true}),
    Author.truncate({cascade: true})
  ]);
}

function seedAuthorWithPostsAndComments() {
  let author, post;
  return Author.create(buildAuthor())
    .then(function(_author) {
      author = _author;
      return Post.create(buildPost(author.id));
    })
    .then(function(_post) {
      post = _post;
      const comments = [];
      for (let i=0; i<10; i++) {
        comments.push(Comment.create(buildComment(author.id, post.id)));
      }
      return Promise.all(comments);
    });
}

function seedTestData(numAuthors=10) {
  const authorsWithPostsAndComments = [];
  for (let i=0; i<numAuthors; i++) {
    authorsWithPostsAndComments.push(seedAuthorWithPostsAndComments());
  }
  return Promise.all(authorsWithPostsAndComments);
}

module.exports = {
  buildAuthor,
  buildPost,
  buildComment,
  dropTables,
  seedTestData
};
