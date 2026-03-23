const mongoose = require("mongoose");
const { Schema } = mongoose;

const paymentSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "users", // Reference to users collection
        required: true
    },
    razorpayOrderId: {
        type: String,
        required: true,
    },
    razorpayPaymentId: {
        type: String,
        // Not required initially, only after success
    },
    razorpaySignature: {
        type: String,
        // Not required initially
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: "INR"
    },
    status: {
        type: String,
        enum: ["created", "success", "failed"],
        default: "created"
    },
    planType: {
        type: String,
        enum: ["monthly", "yearly"],
        required: true
    }
},{timestamps: true});

const Payment = mongoose.model("payments", paymentSchema);
module.exports = Payment;