const express = require('express');
const router = express.Router();

const {Author, Comment, Post} = require('../models');

router.get('/:id', (req, res) => Author.findById(req.params.id)
  .then(author => res.json(author.apiRepr()))
);

router.post('/', (req, res) => {
  const requiredFields = ['userName',];
  for (let i=0; i<requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`
      console.error(message);
      return res.status(400).send(message);
    }
  }

  return Author
    .create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      userName: req.body.userName
    })
    .then(author => res.status(201).json(author.apiRepr()))
    .catch(err => res.status(500).send({message: err.message}));
});

// update an author
router.put('/:id', (req, res) => {

  if (!(req.params.id && req.body.id && req.params.id === req.body.id.toString())) {
    const message = (
      `Request path id (${req.params.id}) and request body id ` +
      `(${req.body.id}) must match`);
    console.error(message);
    res.status(400).json({message: message});
  }

  const toUpdate = {};
  const updateableFields = ['firstName', 'lastName', 'userName'];

  updateableFields.forEach(field => {
    if (field in req.body) {
      toUpdate[field] = req.body[field];
    }
  });

  return Author
    .update(toUpdate, {
      where: {
        id: req.params.id
      }
    })
    .then(() => res.status(204).end())
    .catch(err => res.status(500).json({message: 'Internal server error'}));
});

router.get('/:id/comments', (req, res) => {
  return Author.findById(req.params.id, {
      include: [{model: Comment, as: 'comments'}]
    })
    .then(author => res.json(
      {comments: author.comments.map(comment => comment.apiRepr())}))
});

router.get('/:id/posts', (req, res) => {
  return Author.findById(req.params.id, {
      include: [{model: Post, as: 'posts'}]
    })
    .then(author => res.json(
      {posts: author.posts.map(post => post.apiRepr())}))
});

module.exports = router;