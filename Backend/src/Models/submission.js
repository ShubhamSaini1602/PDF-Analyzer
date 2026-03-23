const mongoose = require("mongoose");
const { Schema } = mongoose;

const submissionSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "users", // Reference to users collection
    required: true
  },
  problemId: {
    type: Schema.Types.ObjectId,
    ref: "problems", // Reference to problems collection
    required: true
  },
  code: {
    type: String,
    required: true
  },
  language: {
    type: String,
    required: true,
    enum: ["javascript", "c++", "java"] 
  },
  status: {
    type: String,
    enum: ["Pending", "Accepted", "Wrong Answer", "Compilation Error", "Runtime Error", "Time Limit Exceeded"],
    default: 'pending'
  },
  runtime: {
    type: Number,  // milliseconds
    default: 0
  },
  memory: {
    type: Number,  // kB
    default: 0
  },
  errorMessage: {
    type: String,
    default: ""
  },
  input: {
    type: String,
    default: null
  },
  expectedOutput: {
    type: String,
    default: null
  },
  // The output that our code gave against the input
  stdout: {
    type: String,
    default: null
  },
  testCasesPassed: {
    type: Number,
    default: 0
  },
  testCasesTotal: {
    type: Number,
    default: 0
  }
}, {timestamps: true});

// Indexing 
submissionSchema.index({userId:1, problemId:1});

const Submission = mongoose.model("submissions", submissionSchema);

module.exports = Submission;