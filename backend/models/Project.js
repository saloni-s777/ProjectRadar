const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },

  status: {
    type: String,
    default: "Pending"
  }
});

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  description: {
    type: String
  },

  progress: {
    type: Number,
    default: 0
  },

  status: {
    type: String,
    default: "On Track"
  },

  tasks: {
    type: [taskSchema],
    default: []
  }
});

module.exports = mongoose.model("Project", projectSchema);