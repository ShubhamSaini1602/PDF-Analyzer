const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema({
    firstName : {
        type:String,
        required:true,
        minLength:3,
        maxLength:20
    },
    lastName : {
        type:String,
    },
    emailId : {
        type:String,
        required:true,
        unique:true,
        trim:true,
        lowercase:true,
        immutable:true
    },
    // Password is conditional
    password : {
        type:String,
        required: function (){
            // Password is ONLY required if the user does NOT have a googleId
            return !this.googleId;
        }
    },
    googleId: {
        type: String,
        unique: true, 
        sparse: true // Allows multiple users to have 'null'
    },
    githubId: { 
        type: String,
        unique: true, 
        sparse: true // Allows multiple users to have 'null'
    },
    // --- SUBSCRIPTION LOGIC ---
    subscription: {
        status: {
            type: String,
            enum: ["free", "premium"],
            default: "free" // Everyone starts as free
        },
        plan: {
            type: String,
            enum: ["none", "monthly", "yearly"],
            default: "none"
        },
        // validUntil: The date when Premium access ends.
        // If (Today > validUntil), they are expired.
        validUntil: {
            type: Date,
            default: null
        },
        // LastPaymentId: Useful for customer support to find the transaction
        lastPaymentId: {
            type: String,
            default: null
        }
    },
    profilePicture :{
        type: String,
        default: ""
    },
    age : {
        type:Number,
        min:6,
        max:80
    },
    role : {
        type:String,
        enum:["user", "admin"],
        default:"user"
    },
    problemsSolved : {
        // Store all the problems solved by a specific user in 
        // an array using their corresponding problem IDs
        type:[{
            type:Schema.Types.ObjectId,
            ref:"problems" // Reference to problems collection
        }],
        default: []
    }
}, {timestamps: true});

const User = mongoose.model("users", userSchema);

module.exports = User;