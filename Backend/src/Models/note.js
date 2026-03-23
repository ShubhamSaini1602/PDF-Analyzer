const mongoose = require("mongoose");
const { Schema } = mongoose;

const noteSchema = new Schema({
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
    content: {
        type: String,
        default: ""
    },
}, {timestamps: true});

// ====== Indexing ======
// This line adds a compound index on userId and problemId, allowing MongoDB to query
// notes faster. 
// The { unique: true } option ensures that each user can have only one note entry per 
// problem in the notes collection.
noteSchema.index({ userId: 1, problemId: 1 }, { unique: true });

const Note = mongoose.model("notes", noteSchema);

module.exports = Note;