const express = require('express');
const router = express.Router();

const {Comment} = require('../models');

router.post('/', (req, res) => {

  const requiredFields = ['comment', 'postId', 'authorId'];
  for (let i=0; i<requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`
      console.error(message);
      return res.status(400).send(message);
    }
  }

  return Comment
    .create({
      comment: req.body.comment,
      post_id: req.body.postId,
      author_id: req.body.authorId
    })
    .then(comment => res.status(201).json(comment.apiRepr()))
    .catch(err => res.status(500).send({message: err.message}));
});

router.put('/:id', (req, res) => {

  if (!(req.params.id && req.body.id && req.params.id === req.body.id.toString())) {
    const message = (
      `Request path id (${req.params.id}) and request body id ` +
      `(${req.body.id}) must match`);
    console.error(message);
    res.status(400).json({message: message});
  }

  const toUpdate = {};
  const updateableFields = ['comment'];

  updateableFields.forEach(field => {
    if (field in req.body) {
      toUpdate[field] = req.body[field];
    }
  });

  return Comment
    .update(toUpdate, {
      where: {
        id: req.params.id
      }
    })
    .then(() => res.status(204).end())
    .catch(err => res.status(500).json({message: 'Internal server error'}));
});

router.delete('/:id', (req, res) => {
  return Comment
    .destroy({
      where: {
        id: req.params.id
      }
    })
    .then(() => res.status(204).end())
    .catch(err => res.status(500).json({message: 'Internal server error'}));
});


module.exports = router;