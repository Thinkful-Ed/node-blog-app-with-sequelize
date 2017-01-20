const bodyParser = require('body-parser');
const express = require('express');
const morgan = require('morgan');

const postsRouter = require('./routes/posts');
const authorsRouter = require('./routes/authors');
const commentsRouter = require('./routes/comments');


// Set up the express app
const app = express();

app.use(morgan('common'));
app.use(bodyParser.json());

app.use('/posts', postsRouter);
app.use('/authors', authorsRouter);
app.use('/comments', commentsRouter)

app.use('*', function(req, res) {
  res.status(404).json({message: 'Not Found'});
});

module.exports = app;
