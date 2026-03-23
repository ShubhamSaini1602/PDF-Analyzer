const { Resend } = require("resend");

// Initialize Resend with your API Key (Store this in .env file as RESEND_API_KEY)
const resend = new Resend(process.env.RESEND_API_KEY);

async function sendEmail(email, otp) {
    try {
        const { data, error } = await resend.emails.send({
            // In the "from" field, we normally specify the domain we want to send emails from. What does "domain" mean? When a website is deployed, it usually has a custom URL,
            // such as "myapp.com". That is your domain name. Since our website is not deployed yet, we don’t have our own domain. So what do we do?
            // For testing, we’ll simply use Resend as the sender. The format looks like this: "Custom_Name <onboarding@resend.dev>"
            // However, this testing approach has limitations. When using Resend as the sender, we can ONLY send emails to the address we used to sign up on the Resend website
            // (in our case: sshubham.ssaini229@gmail.com). We cannot send verification emails to every new user who visits our site — this is just how the free tier works.
            // After deployment, once we have our own domain, we can verify that domain on Resend. Once the domain is verified, we can place it in the "from" field, and then we’ll be
            // able to send emails to any user who visits our website.
            from: "ByteRank <noreply@byte-rank.com>", 
            to: [email], // The email address entered by the user who is visiting our website.
            subject: "Your ByteRank Verification Code",
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Verify ByteRank</title>
                    <style>
                        /* Client-specific resets */
                        body { margin: 0; padding: 0; width: 100% !important; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
                        img { border: 0; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
                    </style>
                </head>
                <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px 0;">
                
                    <div style="max-width: 600px; margin: 0 auto; background-color: #1e293b; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 30px rgba(0, 0, 0, 0.5); border: 1px solid #334155;">
                    
                        <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px 20px; text-align: center; position: relative;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -1px;">ByteRank</h1>
                            <p style="color: rgba(255,255,255,0.8); margin-top: 5px; font-size: 14px;">Master the Code</p>
                        </div>

                        <div style="padding: 40px 30px; text-align: center;">
                            <h2 style="color: #f8fafc; font-size: 22px; margin-bottom: 10px;">Verify your identity</h2>
                            <p style="color: #94a3b8; font-size: 15px; line-height: 1.6; margin-bottom: 30px;">
                                Enter the following code to unlock full access to the ByteRank platform.
                            </p>

                            <div style="background-color: #0f172a; border: 1px dashed #6366f1; border-radius: 12px; padding: 20px; display: inline-block; margin-bottom: 30px;">
                                <span style="font-family: 'Courier New', monospace; font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #8b5cf6; display: block;">
                                    ${otp}
                                </span>
                            </div>

                            <p style="color: #64748b; font-size: 13px;">
                                This code will expire in <strong style="color: #94a3b8">5 minutes</strong>.
                            </p>
                        </div>

                        <div style="background-color: #0f172a; padding: 20px; text-align: center; border-top: 1px solid #334155;">
                            <p style="color: #475569; font-size: 12px; margin: 0;">
                                &copy; ${new Date().getFullYear()} ByteRank. All rights reserved.
                            </p>
                            <p style="color: #475569; font-size: 12px; margin-top: 5px;">
                                If you didn't request this, you can ignore this email.
                            </p>
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
};

module.exports = sendEmail;