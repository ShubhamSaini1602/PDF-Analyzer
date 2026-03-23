import { useState } from "react";

const passwordValidation = {
    // Creating a Regular Expression Pattern
    uppercase: new RegExp(/[A-Z]/),
    lowercase: new RegExp(/[a-z]/),
    number: new RegExp(/[0-9]/),
    specialChar: new RegExp(/[^A-Za-z0-9]/),
};

function checkPasswordStrength(password){
    const p = password || "";
    const checks = {
        hasLength: p.length >= 8,
        // When you want to know whether a regex pattern is found in a string,
        // use the test() method...It returns true or false.
        hasUppercase: passwordValidation.uppercase.test(p),
        hasLowercase: passwordValidation.lowercase.test(p),
        hasNumber: passwordValidation.number.test(p),
        hasSpecialChar: passwordValidation.specialChar.test(p),
    };

    // If the user hasn’t typed anything yet, return a score of 0.
    if (p.length === 0) return { score: 0, checks };
    // If the user enters a password shorter than 8 characters (e.g., "aB1@"), it should still
    // be considered weak — even if it satisfies all other conditions like uppercase, lowercase,
    // number, and special character. We need to handle this edge case so that any password
    // shorter than 8 characters is always treated as weak, regardless of the other criteria.
    if (!checks.hasLength) return { score: 1, checks };
    
    // Okay, so your password is 8 characters or longer (e.g., password123)
    // So, now we start a new score, which I'll call the "Internal Score".
    // We start at internalScore = 2 just for satisfying the length condition
    let internalScore = 2; 
    // The password meets one more condition, so do score++.
    if (checks.hasUppercase) internalScore++;
    if (checks.hasLowercase) internalScore++;
    if (checks.hasNumber) internalScore++;
    if (checks.hasSpecialChar) internalScore++;

    // For example, if the internalScore is 2 or 3, it means the password satisfies 
    // the length requirement + one additional condition — making the total score 2.
    if (internalScore <= 3) return { score: 2, checks }; 
    if (internalScore <= 5) return { score: 3, checks }; 
    if (internalScore === 6) return { score: 4, checks }; 

    return  {score:2, checks }; // return anything - doesn't matter
}

function StrengthIndicator({score}){
    // "" means no color
    const barColorClasses = ["", "bg-red-500", "bg-yellow-500", "bg-blue-500", "bg-green-500"];
    // "" means no text
    const strengthText = ["", "Very Weak", "Weak", "Medium", "Strong"];
    const strengthTextColorClasses = ["text-gray-500", "text-red-500", "text-yellow-500", "text-blue-500", "text-green-500"];
    return (
        <>
        <div className="divs-container">
            {
                Array(4).fill(0).map((num, index) => (
                    <div
                        key={index}
                        className={`strength-bar ${score>index ? barColorClasses[score] : ""}`}
                    ></div>
                ))
            }
        </div>
        <p className={`strength-text ${score>0 ? strengthTextColorClasses[score] : ""}`}>
            {score>0 ? `Password Strength: ${strengthText[score]}` : ""}
        </p>
        </>
    )
}

function RequirementsList({checks}){
    const requirements = [
        { id: "hasLength", text: "At least 8 characters long", met: checks.hasLength },
        { id: "hasLowercase", text: "Contains a lowercase letter (a-z)", met: checks.hasLowercase },
        { id: "hasUppercase", text: "Contains an uppercase letter (A-Z)", met: checks.hasUppercase },
        { id: "hasNumber", text: "Contains a number (0-9)", met: checks.hasNumber },
        { id: "hasSpecialChar", text: "Contains a special character (!@#...)", met: checks.hasSpecialChar },
    ];
    return (
        <>
        <div className="requirementsList">
            {
                requirements.map((obj) => (
                    <div key={obj.id} className={`requirement-item ${obj.met ? "green" : ""}`}>
                        {obj.met ? (
                            <>
                            {/* Tick Icon */}
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" 
                                fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" 
                                strokeLinejoin="round" className="tick-icon">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                <polyline points="22 4 12 14.01 9 11.01" />
                            </svg>
                            </>
                        ) : (
                            <>
                            {/* Cross Icon */}
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" 
                                fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" 
                                strokeLinejoin="round" className="cross-icon">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="15" y1="9" x2="9" y2="15" />
                                <line x1="9" y1="9" x2="15" y2="15" />
                            </svg>
                            </>
                        )}
                        <p className="requirement-txt">{obj.text}</p>
                    </div>
                ))
            }
        </div>
        </>
    )
}

function PasswordInput({label, watchedPassword, error, registrationProps}){
    const [showPassword, setShowPassword] = useState(false);
    const strength = checkPasswordStrength(watchedPassword);

    function togglePasswordVisibility(){
        // Toggle
        setShowPassword(!showPassword);
    }

    // Extract 'disabled' from registrationProps to ensure the password input is disabled when the OTP has been sent
    const isReadOnly = registrationProps.readOnly;

    return (
        <>
        {/* Always Wrap your label, input, error and icon inside a div */}
        <div className="form-element">
            <label className="form-label">{label}</label>
            <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className={`form-input ${error ? "border-red" : ""}`}
                {...registrationProps} // Used spread operator
                readOnly={isReadOnly}
            />
            <i className="ri-lock-fill form-icon"></i>
            <button type="button" className="eye" onClick={togglePasswordVisibility}>
                {showPassword ? (
                    <>
                    {/* Eye-off */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" 
                        fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" 
                        strokeLinejoin="round" className="eye-off">
                        <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                        <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                        <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                        <line x1="2" x2="22" y1="2" y2="22" />
                    </svg>
                    </>
                ) : (
                    <>
                    {/* Eye-on */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" 
                        fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" 
                        strokeLinejoin="round" className="eye-on">
                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                        <circle cx="12" cy="12" r="3" />
                    </svg>
                    </>
                )}
            </button>

            <StrengthIndicator score={strength.score}/>
            <RequirementsList checks={strength.checks}/>

            {error && (
                <p className="form-error">{error.message}</p>
            )}
        </div>
        </>
    )
}

export default PasswordInput;