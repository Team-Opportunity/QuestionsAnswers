const mongoose = require('mongoose');

const idManagerSchema = new mongoose.Schema({
  questionId: Number,
  answerId: Number,
  photoId: Number,
});

const idManagerModel = mongoose.model('IdTracker', idManagerSchema, 'idManager');

module.exports = {
  idManagerModel
};