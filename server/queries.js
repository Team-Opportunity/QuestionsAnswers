const mongoose = require('mongoose');
const connection = require('../models/schema.js');
const idTracker = require('../models/idTracker.js');

const retrieveAllQuestions = (productId, callback) => {
  connection.qAModel.findOne({ productId }, (error, product) => {
    if (error) {
      callback(error, null);
    } else {
      const questions = product.questions.filter((question) => {
        return !question.reported;
      });
      callback(null, questions);
    }
  });
};

const retrieveAllAnswers = (questionId, callback) => {
  connection.qAModel.findOne({ 'questions.questionId': questionId}, (error, question) => {
    if (error) {
      callback(error, null);
    } else {
      let answers;
      for (let i = 0; i < question.questions.length; i++) {
        if (question.questions[i].questionId === Number(questionId)) {
          answers = question.questions[i].answers;
        }
      }
      answers = answers.filter((answer) => {
        return !answer.reported;
      });
      callback(null, answers);
    }
  });
};

const postQuestion = (params, callback) => {
  let newQuestion;
  idTracker.idManagerModel.findOneAndUpdate(null, {
    $inc: { questionId: 1 }
  }, {
    returnOriginal: false
  })
    .then(response => {
      newQuestion = {
        'questionId': response.questionId,
        'dateWritten': new Date(),
        'text': params.body,
        'name': params.name,
        'email': params.email,
        'reported': false,
        'helpful': 0,
        'answers': []
      };
      return connection.qAModel.findOneAndUpdate(
        { 'productId': params.productId },
        { $push: { 'questions': newQuestion } },
        { returnOriginal: false }
      );
    })
    .then(response => callback(null, response))
    .catch(error => callback(error, null));
};

const postAnswer = (params, callback) => {
  let newAnswer, photoCount;
  if (Array.isArray(params.photos)) {
    photoCount = params.photos.length;
  } else {
    photoCount = 0;
  }
  idTracker.idManagerModel.findOneAndUpdate(null, {
    $inc: { answerId: 1, photoId: Number(photoCount) }
  }, {
    returnOriginal: false
  })
    .then(response => {
      let responsePhotoId = Number(response.photoId - photoCount);
      newAnswer = {
        answerId: Number(response.answerId + 1),
        text: params.body,
        name: params.name,
        email: params.email,
        reported: false,
        helpful: 0,
        photos: []
      };
      if (photoCount > 0) {
        for (let i = 0; i < photoCount; i++) {
          newAnswer.photos.push(
            {
              photoId: responsePhotoId,
              url: photoCount[i],
            }
          );
          responsePhotoId++;
        }
      }
      console.log(params.questionId);
      return connection.qAModel.findOneAndUpdate(
        { 'questions.questionId': params.questionId },
        { $push: { 'questions.$.answers': newAnswer } },
        { returnOriginal: false }
      );
    })
    .then(response => callback(null, response))
    .catch(error => callback(error, null));
};

const incrementQuestionHelpfulness = (questionId, callback) => {
  connection.qAModel.findOneAndUpdate(
    { 'questions.questionId': questionId },
    { $inc: { 'questions.$.helpful': 1 } },
    { returnOriginal: false }
  )
    .then(response => callback(null, response))
    .catch(error => callback(error, null));
};

const incrementAnswerHelpfulness = (answerId, callback) => {
  connection.qAModel.findOneAndUpdate(
    { 'questions.answers.answerId': answerId },
    { $inc: { 'questions.$[question].answers.$[answer].helpful': 1 } },
    { arrayFilters: [{ 'question.answers.answerId': Number(answerId) }, { 'answer.answerId': Number(answerId) }], returnOriginal: false }
  )
    .then(response => callback(null, response))
    .catch(error => callback(error, null));
};

const reportQuestion = (questionId, callback) => {
  connection.qAModel.findOneAndUpdate(
    { 'questions.questionId': questionId },
    { $set: { 'questions.$.reported': true } },
    { returnOriginal: false }
  )
    .then(response => callback(null, reponse))
    .catch(error => callback(error, null));
};

const reportAnswer = (answerId, callback) => {
  connection.qAModel.findOneAndUpdate(
    { 'questions.answers.answerId': answerId },
    { $set: { 'questions.$[question].answers.$[answer].reported': true } },
    { arrayFilters: [{ 'question.answers.answerId': Number(answerId) }, { 'answer.answerId': Number(answerId) }], returnOriginal: false }
  )
    .then(response => callback(null, reponse))
    .catch(error => callback(error, null));
};

module.exports = {
  retrieveAllQuestions,
  retrieveAllAnswers,
  postQuestion,
  postAnswer,
  incrementQuestionHelpfulness,
  incrementAnswerHelpfulness,
  reportQuestion,
  reportAnswer
};
