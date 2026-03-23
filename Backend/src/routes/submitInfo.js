const express = require("express");
const validateToken = require("../middleware/validateToken");
const submitRouter = express.Router();
const Problem = require("../Models/problem");
const Submission = require("../Models/submission");
const {getLanguageByID, submitBatch, submitTokens} = require("../utils/createProblemUtility");

// Submitting a Problem ----> POST Request
// Token validation is performed here to ensure that only authenticated and authorized users can submit solutions.
// This adds a security layer, preventing unauthorized submissions and ensuring each submission is linked to a verified user.
submitRouter.post("/submit/:id", validateToken, async(req, res) => {
    try{
        const userId = req.result._id;
        const problemId = req.params.id;

        // The user will only send the code and the programming language.
        const {code, language} = req.body;
        if(!userId || !problemId || !code || !language){
            throw new Error("Some Fields are Missing");
        }

        // Fetch the problem document from the problems collection in the database 
        // to access its hiddenTestCases.
        const problem = await Problem.findById(problemId);

        // Now, insert all the relevant information about this submission
        // in the submissions collection of the database with a status of pending for future reference
        // Note: Other fields like runtime, memory, etc. will be assigned their default values,
        // since the code hasn’t been executed yet and we don’t have those metrics at this stage.
        const submittedResult = await Submission.create(
            // Inserting this object
            {
                userId,
                problemId,
                code, // submitted code
                language,
                status:"Pending",
                testCasesTotal:problem.hiddenTestCases.length
            }
        );

        // After inserting the submission, the server now wants to check whether this 
        // submitted code is correct or not? So, as usual Judge0 will help us in that 
        // matter. So, the server sends a submissions array to Judge0.
        const languageID = getLanguageByID(language);

        // Creating a submissions array (Batch)
        const submissions = problem.hiddenTestCases.map((obj1) => (
            {
                source_code: code,
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

        let testCasesPassed = 0;
        let runtime = 0;
        let memory = 0;
        let status = "Accepted";
        let errorMessage = null;
        let input = null;
        let expectedOutput = null;
        let stdout = null;

        // Loop through all hiddenTestCases Results
        for(let obj of submissionsArray){
            if(obj.status_id===3){
                // Case: Accepted
                testCasesPassed++;
                runtime += parseFloat(obj.time);
                memory = Math.max(memory, obj.memory);
            }
            else{
                // Case: FAILED (Wrong Answer, TLE, Error, etc.)
                if (obj.status_id === 4) { status = "Wrong Answer"; }
                else if (obj.status_id === 5) { status = "Time Limit Exceeded"; }
                else if (obj.status_id === 6) { status = "Compilation Error"; }
                else if (obj.status_id >= 7 && obj.status_id <= 12) { status = "Runtime Error"; }
                else { status = "Application Error"; }

                // Get the error message
                errorMessage = obj.stderr || obj.compile_output || "An error occurred.";

                // 3. CAPTURE THE FAILING CASE DETAILS
                input = obj.stdin;
                expectedOutput = obj.expected_output;
                stdout = obj.stdout;

                // As soon as we encounter a failing test case, we stop immediately.
                // No need to go to the remaining test cases until the user fixes this one.
                break;
            }
        }

        // And finally, from this information we’ll update our submission  
        // info which we earlier inserted in the database and save it.
        submittedResult.status = status;
        submittedResult.testCasesPassed = testCasesPassed;
        submittedResult.errorMessage = errorMessage;
        submittedResult.runtime = runtime;
        submittedResult.memory = memory;
        submittedResult.input = input;
        submittedResult.expectedOutput = expectedOutput;
        submittedResult.stdout = stdout;

        await submittedResult.save();

        // Since the user has successfully solved a problem, we’ll store this 
        // problem’s problemID in the problemsSolved array inside the userSchema. 
        if(status==="Accepted" && !req.result.problemsSolved.includes(problemId)){
            req.result.problemsSolved.push(problemId);
            await req.result.save(); // Now, save the changes
        }

        res.status(201).send(submittedResult);
    }
    catch(err){
        res.status(500).send("Error: " + err.message);
    }
});

// Running a Problem ----> POST Request ----> Almost Same Code as that of Submit a Problem
submitRouter.post("/run/:id", validateToken, async(req,res) => {
    try{
        const userId = req.result._id;
        const problemId = req.params.id;

        // The user will only send the code and the programming language.
        const {code, language} = req.body;
        if(!userId || !problemId || !code || !language){
            throw new Error("Some Fields are Missing");
        }

        // Fetch the problem document from the problems collection in the database 
        // to access its hiddenTestCases.
        const problem = await Problem.findById(problemId);

        // The server now wants to check whether this submitted code is correct or 
        // not? So, as usual Judge0 will help us in that matter.
        // So, the server sends a submissions array to Judge0.
        const languageID = getLanguageByID(language);

        // Creating a submissions array (Batch)
        const submissions = problem.visibleTestCases.map((obj1) => (
            {
                source_code: code,
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

        res.status(201).send(submissionsArray);
    }
    catch(err){
        res.status(500).send("Error: " + err.message);
    }
});

module.exports = submitRouter;



