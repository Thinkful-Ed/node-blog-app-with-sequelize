const express = require('express');
const router = express.Router();

const {Post, Comment} = require('../models');


router.get('/', (req, res) => {
  return Post.findAll().then(posts => res.json(
    {posts: posts.map(post => post.apiRepr())}));
});

router.get('/:id', (req, res) => {
  return Post
    .findById(req.params.id)
    .then(post => res.json(post.apiRepr()));
});

router.post('/', (req, res) => {
  const requiredFields = ['title', 'content', 'authorId'];
  for (let i=0; i<requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`
      console.error(message);
      return res.status(400).send(message);
    }
  }

  return Post.create({
    title: req.body.title,
    content: req.body.content,
    post_id: req.body.postId,
    author_id: req.body.authorId
  })
  .then(post => {
    return res.status(201).json(post.apiRepr());
  })
  .catch(err => {
    return res.status(500).send({message: err.message});
  });
});

router.put('/:id', (req, res) => {
  if (!(req.params.id && req.body.id && req.params.id === req.body.id.toString())) {
    const message = (
      `Request path id (${req.params.id}) and request body id ` +
      `(${req.body.id}) must match`);
    res.status(400).json({message: message});
  }

  const toUpdate = {};
  const updateableFields = ['title', 'content'];

  updateableFields.forEach(field => {
    if (field in req.body) {
      toUpdate[field] = req.body[field];
    }
  });

  return Post
    .update(toUpdate, {
      where: {
        id: req.params.id
      }
    })
    .then(() => {
      res.status(204).end()
    })
    .catch(err => res.status(500).json({message: 'Internal server error'}));
});

router.delete('/:id', (req, res) => {
  return Post
    .destroy({
      where: {
        id: req.params.id
      }
    })
    .then(() => res.status(204).end())
    .catch(err => res.status(500).json({message: 'Internal server error'}));
});

router.get('/:id/comments', (req, res) => {
  return Post.findById(
      req.params.id, {include: [{model: Comment, as: 'comments'}]}
    )
    .then(post => res.json({comments: post.comments.map(
      comment => comment.apiRepr())}))
    .catch(err => res.status(500).json({message: 'Internal server error'}));
});

module.exports = router;
