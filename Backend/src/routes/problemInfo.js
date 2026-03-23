const express = require("express");
const problemRouter = express.Router();
const Problem = require("../Models/problem");
const validateAdmin = require("../middleware/validateAdmin");
const {getLanguageByID, submitBatch, submitTokens} = require("../utils/createProblemUtility");
const validateToken = require("../middleware/validateToken");
const Submission = require("../Models/submission");


// Creating a Problem -> Requires Admin Access First
problemRouter.post("/create",validateAdmin, async(req,res) => {
    try{
        // When an Admin creates a new problem (e.g., "Two Sum"),
        // we must validate the data before saving it to the database.
        const { title, description, difficulty, tags, visibleTestCases, 
            hiddenTestCases, startCode, referenceSolution, problemCreator
        } = req.body;

        // Check Whether Reference Solutions are Correct or Not
        for(let {language, completeCode} of referenceSolution){
            const languageID = getLanguageByID(language);

            // Creating a submissions array (Batch)
            const submissions = visibleTestCases.map((obj1) => (
                {
                    source_code: completeCode,
                    language_id: languageID,
                    stdin: obj1.input,
                    expected_output: obj1.output
                }
            ));

            // Now, we will send this submissions array (batch) to Judge0
            // and it will return an array of objects
            const arrayOfObjects = await submitBatch(submissions);

            // Converting this array of objects into array of tokens
            const arrayOfTokens = arrayOfObjects.map((obj2) => obj2.token);

            // Now, we will send these tokens to Judge0 and it will return an
            // object that contains a submissions array
            const finalAnswer = await submitTokens(arrayOfTokens);
            const submissionsArray = finalAnswer.submissions;

            for(let obj3 of submissionsArray){
                if(obj3.status_id===4){
                    console.log("Judge0 Validation Failed: Wrong Answer");
                    return res.status(400).send("Wrong Answer");
                }
                else if(obj3.status_id===5){
                    console.log("Judge0 Validation Failed: TLE");
                    return res.status(400).send("Time Limit Exceeded");
                }
                else if(obj3.status_id===6){
                    console.log("Judge0 Validation Failed: Compilation Error");
                    return res.status(400).send("Compilation Error");
                }
                else if(obj3.status_id===7){
                    console.log("Judge0 Validation Failed: Runtime Error (SIGSEGV)");
                    return res.status(400).send("Runtime Error (SIGSEGV)");
                }
                else if(obj3.status_id===8){
                    console.log("Judge0 Validation Failed: Runtime Error (SIGXFSZ)");
                    return res.status(400).send("Runtime Error (SIGXFSZ)");
                }
            }
        }

        // Once all reference solutions provided by the admin across all languages 
        // are verified successfully, we can safely insert the problem into the database.
        await Problem.create(
            {
                ...req.body,
                problemCreator: req.result._id
            }
        );
        res.status(201).send("Problem Saved Successfully");
    }
    catch(err){
        res.status(400).send("Error: " + err.message);
    }
});

// Updating a Problem -> Requires Admin Access First
problemRouter.put("/update/:id", validateAdmin, async(req,res) => {
    try{
        const id = req.params.id;
        if(!id){
            throw new Error("ID is Missing");
        }
        // Verify whether this problem ID exists in the database,
        // since an update can only be performed on an existing record.
        const problem = await Problem.findById(id);
        if(!problem){
            throw new Error("Problem Doesn't Exist");
        }

        // Now, before updating the record in the database, we first verify whether
        // the referenceSolutions field in the updated data sent by the user (req.body)
        // is correct or not, just like we did during the problem creation process.
        const { title, description, difficulty, tags, visibleTestCases, 
            hiddenTestCases, startCode, referenceSolution, problemCreator
        } = req.body;

        // Check Whether Reference Solutions are Correct or Not
        for(let {language, completeCode} of referenceSolution){
            const languageID = getLanguageByID(language);

            // Creating a submissions array (Batch)
            const submissions = visibleTestCases.map((obj1) => (
                {
                    source_code: completeCode,
                    language_id: languageID,
                    stdin: obj1.input,
                    expected_output: obj1.output
                }
            ));

            // Now, we will send this submissions array (batch) to Judge0
            // and it will return an array of objects
            const arrayOfObjects = await submitBatch(submissions);

            // Converting this array of objects into array of tokens
            const arrayOfTokens = arrayOfObjects.map((obj2) => obj2.token);

            // Now, we will send these tokens to Judge0 and it will return an
            // object that contains a submissions array
            const finalAnswer = await submitTokens(arrayOfTokens);
            const submissionsArray = finalAnswer.submissions;

            for(let obj3 of submissionsArray){
                if(obj3.status_id===4){
                    console.log("Judge0 Validation Failed: Wrong Answer");
                    return res.status(400).send("Wrong Answer");
                }
                else if(obj3.status_id===5){
                    console.log("Judge0 Validation Failed: TLE");
                    return res.status(400).send("Time Limit Exceeded");
                }
                else if(obj3.status_id===6){
                    console.log("Judge0 Validation Failed: Compilation Error");
                    return res.status(400).send("Compilation Error");
                }
                else if(obj3.status_id===7){
                    console.log("Judge0 Validation Failed: Runtime Error (SIGSEGV)");
                    return res.status(400).send("Runtime Error (SIGSEGV)");
                }
                else if(obj3.status_id===8){
                    console.log("Judge0 Validation Failed: Runtime Error (SIGXFSZ)");
                    return res.status(400).send("Runtime Error (SIGXFSZ)");
                }
            }
        }

        // Once all referenceSolutions are verified, we can safely update the problem
        const updatedData = await Problem.findByIdAndUpdate(id, req.body, {runValidators:true, new:true});

        // Why do we send the updated data back to the client (user)?
        // Even though the database is successfully updated, the frontend (client) doesn’t automatically know
        // what the latest version of the data looks like.
        // By sending the updated problem back, the frontend immediately receives the final, authoritative version
        // from the database and can instantly update its UI to reflect the changes.
        res.status(200).send(updatedData);
    }
    catch(err){
        res.status(500).send("Error: " + err.message);
    }
});

// Deleting a Problem -> Requires Admin Access First
problemRouter.delete("/delete/:id", validateAdmin, async(req,res) => {
    try{
        const id = req.params.id;
        if(!id){
            throw new Error("Id is Missing");
        }
        // Verify whether this problem ID exists in the database,
        // since an delete can only be performed on an existing record.
        const problem = await Problem.findById(id);
        if(!problem){
            throw new Error("Problem doesn't exist");
        }

        await Problem.findByIdAndDelete(id);
        res.status(200).send("Problem Deleted Successfully");
    }
    catch(err){
        res.status(500).send("Error: " + err.message);
    }
});

// Fetching a Single Problem
problemRouter.get("/getProblem/:id", validateToken, async(req,res) => {
    try{
        const id = req.params.id;
        if(!id){
            throw new Error("Id is Missing");
        }
        const problem = await Problem.findById(id).select("_id title description difficulty tags companyTags visibleTestCases hiddenTestCases startCode referenceSolution");
        if(!problem){
            throw new Error("Problem doesn't Exist");
        }

        res.status(200).send(problem);
    }
    catch(err){
        res.status(400).send("Error: " + err.message);
    }
});

// Fetching all Problems
problemRouter.get("/getAllProblems", validateToken, async(req,res) => {
    try{
        const allProblems = await Problem.find({}).select(" _id title difficulty tags companyTags");
        if(allProblems.length===0){
            throw new Error("No problem exist at the moment");
        }

        res.status(200).send(allProblems);
    }
    catch(err){
        res.status(400).send("Error: " + err.message);
    }
});

// Fetching all problems solved by a specific user
problemRouter.get("/user/solvedProblems", validateToken, async(req,res) => {
    try{
        // The await keyword is used here because populate() is an asynchronous operation.
        // It first takes the list of problem IDs stored in the problemsSolved array,
        // then queries the database to find the actual problem documents those IDs refer to.
        // After retrieving them, it comes back and replaces each problem ID in the array 
        // with the corresponding full problem document it found.
        const user = await req.result.populate({
            path: "problemsSolved", // Kis schema field ko populate karna hai
            // Kaun si fields select karke laani hai from the problem document
            select: "_id title difficulty tags" 
        });

        res.status(200).send(user.problemsSolved);
    }
    catch(err){
        res.status(500).send("Error: " + err.message);
    }
});

// Fetching all submissions made by a user for a specific problem
problemRouter.get("/getSubmissions/:pid", validateToken, async(req,res) => {
    try{
        const userId = req.result._id;
        const problemId = req.params.pid;

        const problemSubmissions = await Submission.find({userId, problemId});
        if(problemSubmissions.length===0){
            throw new error("No Submissions made yet.")
        }

        res.status(201).send(problemSubmissions);
    }
    catch(err){
        res.status(500).send("Error: " + err.message);
    }
});

module.exports = problemRouter;







