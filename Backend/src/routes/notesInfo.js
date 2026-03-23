// notesInfo.js
const express = require("express");
const notesRouter = express.Router();
const Problem = require("../Models/problem");
const Note = require("../Models/note");
const validateToken = require("../middleware/validateToken");

// Auto-Save the notes made by the user for a specific problem in the database
// We’re using the validateToken middleware here not specifically for user validation,
// but to access the userId. When the token is valid, the middleware adds a `result` 
// object to req, allowing us to retrieve the user’s ID using req.result._id.
notesRouter.post("/saveNotes", validateToken, async(req,res) => {
    try{
        // Extract the problemId and the note data provided by the frontend for saving 
        // in the database.
        const {problemId, content} = req.body;
        const userId = req.result._id;

        // Verify whether this problem ID exists in the database or not
        const problem = await Problem.findById(problemId);
        if(!problem){
            throw new error("Problem Doesn't Exist");
        }

        // If the note for this problem is already present in the notes collection, update it; 
        // otherwise, create a new note in the database.
        const note = await Note.findOneAndUpdate(
            // Find the note corresponding to this userId and problemId.
            { userId, problemId },
            // Replace the current note content with the new updated content.
            { content }, 
            // new: true --> Return the updated note instead of the old one.
            // upsert: true --> If the note does not exist, it will be created (upsert = update + insert).
            // setDefaultsOnInsert: true --> If upsert creates a new note, apply the SCHEMA DEFAULTS to that new note.
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        res.status(200).send(note);
    }
    catch(err){
        res.status(500).send("Error: " + err.message);
    }
});

// Fetch the notes for a specific problem
notesRouter.get("/getNote/:problemId", validateToken, async(req,res) => {
    try{
        const problemId = req.params.problemId;
        const userId = req.result._id;

        // Verify whether this problem ID exists in the database or not
        const problem = await Problem.findById(problemId);
        if(!problem){
            throw new error("Problem Doesn't Exist");
        }

        // Fetch the note from the notes collection
        const note = await Note.findOne({userId, problemId});

        res.status(200).send(note);
    }
    catch(err){
        res.status(500).send("Error: " + err.message);
    }
});

module.exports = notesRouter;