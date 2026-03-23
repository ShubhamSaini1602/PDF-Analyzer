const mongoose = require("mongoose");
const { Schema } = mongoose;

const problemSchema = new Schema({
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    difficulty:{
        type:String,
        enum:["Easy", "Medium", "Hard"],
        required:true
    },
    tags:{
        // Array of strings
        type: [String], // For E.g., "tags": ["Array", "Math"]
        enum:[
            "Math", "Array", "String", "Recursion", "LinkedList", 
            "Stack", "Tree", "Graph", "Dynamic Programming", "Two Pointers", "Hash Table",
            "Binary Search", "Backtracking", "Sorting", "Heap", "Greedy"
        ],
        required:true
    },
    companyTags: {
        type: [String], // E.g., ["Amazon", "Google", "Microsoft"]
        required: false
    },
    visibleTestCases:[
        {
            input:{
                type:String,
                required:true
            },
            output:{
                type:String,
                required:true
            },
            explanation:{
                type:String,
                required:true
            }
        }
    ],
    hiddenTestCases:[
        {
            input:{
                type:String,
                required:true
            },
            output:{
                type:String,
                required:true
            }
        }
    ],
    startCode:[
        {
            language:{
                type:String,
                required:true
            },
            initialCode:{
                type:String,
                required:true
            }
        }
    ],
    referenceSolution:[
        {
            language:{
                type:String,
                required:true
            },
            completeCode:{
                type:String,
                required:true
            }
        }
    ],
    problemCreator:{
        type:Schema.Types.ObjectId,
        ref:"users", // Reference to users Collection
        required:true
    }

},{timestamps:true});

const Problem = mongoose.model("problems", problemSchema);

module.exports = Problem;