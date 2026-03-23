const express = require("express");
const paymentRouter = express.Router();
const Razorpay = require("razorpay");
const crypto = require("crypto"); // Built-in Node module
const Payment = require("../Models/payment");
const validateToken = require("../middleware/validateToken");
const User = require("../Models/user");

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create a Bill/Order and send it to frontend
paymentRouter.post("/create-order", validateToken, async(req, res) => {
    try {
        const { planType, amount } = req.body;
        const userId = req.result._id;

        if (!planType || !amount) {
            throw new Error("Plan type and amount are required.");
        }

        const options = {
            amount: amount * 100, 
            currency: "INR",
            receipt: `receipt_${Date.now()}`, // Unique receipt ID
            notes: {
                userId: userId.toString(),
                planType: planType
            }
        };

        const order = await razorpay.orders.create(options);

        await Payment.create({
            userId,
            razorpayOrderId: order.id,
            amount: amount,
            planType: planType,
            status: "created"
        });

        // Send Bill/Order to Frontend
        res.status(200).json({
            success: true,
            order // Contains order_id needed by frontend
        });

    } 
    catch (err) {
        console.log("Payment Order Error:", err);
        res.status(500).json({ message: "Failed to create payment order" });
    }
});

// Verify Payment Logic
paymentRouter.post("/verify-payment", validateToken, async(req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        const userId = req.result._id;

        const body = razorpay_order_id + "|" + razorpay_payment_id;
        
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex");

        // Compare Signatures
        const isAuthentic = expectedSignature === razorpay_signature;

        if (isAuthentic) {
            // --- PAYMENT IS GENUINE ---
            // Update Payment Status in DB
            const paymentDetails = await Payment.findOneAndUpdate({ razorpayOrderId: razorpay_order_id },
                {
                    razorpayPaymentId: razorpay_payment_id,
                    razorpaySignature: razorpay_signature,
                    status: "success"
                },
                { new: true }
            );

            // Calculate Expiry Date
            
            // This creates a Date object with the current date and time
            let expiryDate = new Date();
            // expiryDate.getDate() → gets the day of the month
            // expiryDate.setDate() → updates the date by adding days
            if (paymentDetails.planType === "monthly") {
                expiryDate.setDate(expiryDate.getDate() + 30); // Add 30 Days
            } 
            else if (paymentDetails.planType === "yearly") {
                expiryDate.setDate(expiryDate.getDate() + 365); // Add 1 Year
            }

            // UNLOCK THE PREMIUM FEATURES: Update User Profile
            const updatedUser = await User.findByIdAndUpdate(userId, 
                {
                    $set: {
                        "subscription.status": "premium",
                        "subscription.plan": paymentDetails.planType,
                        "subscription.validUntil": expiryDate,
                        "subscription.lastPaymentId": razorpay_payment_id
                    }
                },
                {new: true}
            );

            res.status(200).json({ 
                success: true, 
                message: "Payment verified and Subscription activated!",
                payment_id: paymentDetails.razorpayPaymentId,
                user: updatedUser // Send updated user back to frontend
            });

        } 
        else {
            // --- FRAUD ATTEMPT ---
            await Payment.findOneAndUpdate({ razorpayOrderId: razorpay_order_id },
                { status: "failed" }
            );
            res.status(400).json({ success: false, message: "Invalid Payment Signature" });
        }

    } 
    catch (err) {
        console.log("Payment Verify Error:", err);
        res.status(500).json({ message: "Internal Server Error during verification" });
    }
});

module.exports = paymentRouter;