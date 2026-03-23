const { Resend } = require("resend");

// Initialize Resend with your API Key (Store this in .env file as RESEND_API_KEY)
const resend = new Resend(process.env.RESEND_API_KEY);

async function sendContactSupportEmail(userDetails, subject, message) {
    try {
        const { data, error } = await resend.emails.send({
            from: "ByteRank Contact <noreply@byte-rank.com>",
            to: [process.env.ADMIN_EMAIL], // Add ADMIN_EMAIL to your .env
            reply_to: userDetails.email,   // This lets you reply directly to the user
            subject: `New Support Request: ${subject}`,
            html: `
                <!DOCTYPE html>
                <html>
                <body style="font-family: 'Segoe UI', sans-serif; background-color: #f1f5f9; padding: 40px 0;">
                    <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                        <div style="background: #0f172a; padding: 30px; text-align: center;">
                            <h1 style="color: #fff; margin: 0; font-size: 24px;">ByteRank Support</h1>
                        </div>
                        <div style="padding: 30px;">
                            <div style="border-left: 4px solid #6366f1; padding-left: 15px; margin-bottom: 20px;">
                                <p style="margin: 0; color: #64748b; font-size: 12px;">FROM</p>
                                <h3 style="margin: 5px 0 0; color: #0f172a;">${userDetails.name}</h3>
                                <p style="margin: 0; color: #6366f1;">${userDetails.email}</p>
                            </div>
                            
                            <p style="margin: 0; color: #64748b; font-size: 12px;">SUBJECT</p>
                            <p style="margin: 5px 0 20px; font-weight: 600; color: #0f172a;">${subject}</p>
                            
                            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
                            
                            <p style="margin: 0; color: #64748b; font-size: 12px;">MESSAGE</p>
                            <p style="margin-top: 10px; color: #334155; line-height: 1.6; white-space: pre-wrap;">${message}</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
        });

        if (error) {
            console.log("Resend Error:", error);
            return false;
        }

        console.log("Email sent successfully:", data);
        return true;
    } 
    catch (err) {
        console.log("Unexpected Error sending email:", err);
        throw new Error("Failed to send verification email.");
    }
}

module.exports = sendContactSupportEmail;