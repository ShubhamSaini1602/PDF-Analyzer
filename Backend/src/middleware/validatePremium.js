// This middleware runs AFTER validateToken
// validateToken finds WHO the user is.
// validatePremium checks WHAT access they have.

const validatePremium = async(req, res, next) => {
    try {
        const user = req.result;
        if (!user) {
            throw new Error("User not authenticated");
        }

        // Check Status
        if (user.subscription?.status !== 'premium') {
            throw new Error("Access Denied. Premium subscription required.");
        }

        // Check Expiry
        const validUntil = user.subscription?.validUntil;
        if (!validUntil) {
            throw new Error("System Error: No expiry date found for premium subscription.");
        }

        const now = new Date();
        const expiryDate = new Date(validUntil);

        // If (Today > ValidUntil), the user's premium access has expired
        if (now > expiryDate) {
            throw new Error("Subscription expired. Please renew.");
        }

        // User is Premium & Active -> Allow Access
        next();

    } 
    catch (err) {
        console.log("Premium Middleware Error:", err);
        return res.status(403).json({ message: "Authorization Failed" });
    }
};

module.exports = validatePremium;