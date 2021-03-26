const express = require('express');
const server = express();
const mongoose = require('mongoose');
const path = require('path');
const PORT = 3001;
const queries = require('./queries');
const bodyParser = require('body-parser');

server.use(express.static(__dirname + '../../legacy-fec-codebase'));

server.use(bodyParser.json());

server.get('/qa/questions/:product_id', (req, res) => {
  let params = req.params.product_id;
  queries.retrieveAllQuestions(params, (error, questions) => {
    if (error) {
      res.status(500).send(error);
    } else {
      res.send(questions);
    }
  });
});

server.get('/qa/questions/:question_id/answers', (req, res) => {
  let params = req.params.question_id;
  queries.retrieveAllAnswers(params, (error, answers) => {
    if (error) {
      res.status(500).send(error);
    } else {
      res.send(answers);
    }
  });
});

server.post('/qa/questions', (req, res) => {
  let params = {
    body: req.body.body,
    name: req.body.name,
    email: req.body.email,
    productId: req.body.product_id
  };
  queries.postQuestion(params, (error, success) => {
    if (error) {
      res.status(500).send(error);
    } else {
      res.status(201).send(success);
    }
  });
});

server.post('/qa/questions/:question_id/answers', (req, res) => {
  let params = {
    body: req.body.body,
    name: req.body.name,
    email: req.body.email,
    photos: req.body.photos,
    questionId: req.params.question_id,
  };
  queries.postAnswer(params, (error, success) => {
    if (error) {
      res.status(500).send(error);
    } else {
      res.status(201).send(success);
    }
  });
});

server.put('/qa/questions/:question_id/helpful', (req, res) => {
  let params = req.params.question_id;
  queries.incrementQuestionHelpfulness(params, (error, success) => {
    if (error) {
      res.status(500).send(error);
    } else {
      res.status(204).send(success);
    }
  });
});

server.put('/qa/answers/:answer_id/helpful', (req, res) => {
  let params = req.params.answer_id;
  queries.incrementAnswerHelpfulness(params, (error, success) => {
    if (error) {
      res.status(500).send(error);
    } else {
      res.status(204).send(success);
    }
  });
});

server.put('/qa/questions/:question_id/report', (req, res) => {
  let params = req.params.question_id;
  queries.reportQuestion(params, (error, success) => {
    if (error) {
      res.status(500).send(error);
    } else {
      res.status(204).send(success);
    }
  });
});

server.put('/qa/answers/:answer_id/report', (req, res) => {
  let params = req.params.answer_id;
  queries.reportAnswer(params, (error, success) => {
    if (error) {
      res.status(500).send(error);
    } else {
      res.status(204).send(success);
    }
  });
});

server.listen(PORT, () => {
  const url = 'mongodb://127.0.0.1:27017/SDCQuestions';
  mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }, (error) => {
    if (error) {
      throw error;
    } else {
      console.log('Connected to MongoDB');
    }
  });
  console.log(`Server is running and listening on port ${PORT}`);
});
