import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Aurora from "../components/Aurora";
import PasswordInput from './PasswordInput';
// ----------------
import { useDispatch, useSelector } from "react-redux";
import { sendOtp, registerUser } from '../CentralStore/authSlice';
import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Link } from "react-router";
import SignUpVideo from "../assets/sign-up-video.mp4"

const passwordValidation = {
    // Creating a Regular Expression Pattern
    uppercase: new RegExp(/[A-Z]/),
    lowercase: new RegExp(/[a-z]/),
    number: new RegExp(/[0-9]/),
    specialChar: new RegExp(/[^A-Za-z0-9]/),
};

// Validation Rules
const signupSchema = z.object({
    firstName: z.string().min(3, "First name must be at least 3 characters long."),
    lastName: z.string().min(3, "Last name must be at least 3 characters long."),
    emailId: z.email("Please enter a valid email address."),
    // z.regex() is used with strings to ensure that the given Regular Expression pattern
    // is found in the string
    password: z.string().min(8, "Password must be at least 8 characters long.")
        .regex(passwordValidation.uppercase, "Must contain one uppercase letter.")
        .regex(passwordValidation.lowercase, "Must contain one lowercase letter.")
        .regex(passwordValidation.number, "Must contain one number.")
        .regex(passwordValidation.specialChar, "Must contain one special character."),

    otp: z.string().length(6,"OTP must be exactly 6 digits.")
});

function SignUp(){
    const dispatch = useDispatch();
    const {isAuthenticated, loading, otpSent, otpLoading} = useSelector((state) => state.auth);
    const navigate = useNavigate();
    // ----------------------------------------

    const {
        register,
        handleSubmit,
        watch,
        trigger, // Allows us to validate specific fields without submitting
        getValues, // Allows us to read field values without submitting
        formState: { errors },
    } = useForm({resolver: zodResolver(signupSchema)});

    // "watch" the 'password' field
    const password = watch('password');
    // ---------------------------------------

    // Redundant — not functionally needed, kept only as a safety measure
    useEffect(() => {
        if(isAuthenticated){
            navigate("/");
        }
    }, [isAuthenticated]);

    // STEP 1: VERIFY EMAIL
    async function handleVerifyEmail() {
        const isValid = await trigger(["firstName", "lastName", "emailId", "password"]);

        // Trigger returns boolean(true/false)
        if (isValid) {
            const email = getValues("emailId");
            dispatch(sendOtp(email));
        }
    };

    // SUBMIT OTP & CREATE ACCOUNT
    const onSubmit = (data) => {
        dispatch(registerUser(data));
    }

    return (
        <>
        <Aurora
            colorStops={["#3730a3", "#86198f", "#155e75"]}
            blend={1}
            amplitude={1}
            speed={0.5}
        />
        
        <div className="sign-up-container">
            <div className="text-video">
                <h2 className="first-text">Welcome to <span className="rise">ByteRank.</span></h2>
                <p className="second-text">Create your ByteRank account and begin your climb to the top.</p>
                <video height="500" autoPlay muted loop className="video">
                    <source src={SignUpVideo} type="video/mp4"></source>
                    Your Browser does not support the video element
                </video>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="form">
                <h2 className="form-heading">Create Account</h2>
                {/* Always Wrap your label,input,error and icon inside a div */}
                <div className="form-element">
                    <label className="form-label">First Name</label>
                    <input
                        type="text"
                        placeholder="First Name"
                        className={`form-input ${errors.firstName ? "border-red" : ""}`}
                        {...register("firstName")}
                        readOnly={otpSent} // Disable input if OTP is sent
                    />
                    {errors.firstName && (
                        <>
                        <p className="form-error">{errors.firstName.message}</p>
                        </>
                    )}
                    <i className="ri-user-3-fill form-icon"></i>
                </div>
                {/* ----------------------- */}
                <div className="form-element">
                    <label className="form-label">Last Name</label>
                    <input
                        type="text"
                        placeholder="Last Name"
                        className={`form-input ${errors.lastName ? "border-red" : ""}`}
                        {...register("lastName")}
                        readOnly={otpSent}
                    />
                    {errors.lastName && (
                        <>
                        <p className="form-error">{errors.lastName.message}</p>
                        </>
                    )}
                    <i className="ri-user-3-fill form-icon"></i>
                </div>
                {/* ----------------------- */}
                <div className="form-element">
                    <label className="form-label">Email</label>
                    <input
                        type="email"
                        placeholder="Enter your Email"
                        className={`form-input ${errors.emailId ? "border-red" : ""}`}
                        {...register("emailId")}
                        readOnly={otpSent}
                    />
                    {errors.emailId && (
                        <>
                        <p className="form-error">{errors.emailId.message}</p>
                        </>
                    )}
                    <i className="ri-mail-fill form-icon"></i>
                </div>
                {/* ----------------------- */}
                <PasswordInput
                    label="Password"
                    watchedPassword={password}
                    error={errors.password}
                    registrationProps={{ ...register("password"), readOnly: otpSent }}
                ></PasswordInput>
                {/* ------------------------------------- */}

                {/* OTP INPUT FIELD (Only visible when otpSent is true) --- */}
                {otpSent && (
                    <div className="form-element" style={{marginTop: "10px", animation: "fadeIn 0.5s"}}>
                        <label className="form-label" style={{color: "#4ade80"}}>Verification Code Sent to your Email !</label>
                        <input
                            type="text"
                            placeholder="Enter 6-digit Code"
                            className="form-input"
                            maxLength={6}
                            {...register("otp")}
                        />
                        {errors.otp && (
                            <>
                            <p className="form-error">{errors.otp.message}</p>
                            </>
                        )}
                        <i className="ri-key-fill form-icon"></i>
                    </div>
                )}

                {/* --- DYNAMIC BUTTON --- */}
                {!otpSent ? (
                    // Button State 1: Verify Email
                    <button 
                        type="button" // Important: type="button" prevents form submit
                        className="create-account" 
                        disabled={otpLoading}
                        onClick={handleVerifyEmail}
                    >
                        {otpLoading ? "Sending OTP..." : "Verify Email"}
                    </button>
                ) : (
                    // Button State 2: Create Account
                    <button 
                        type="submit" // Important: type="submit" triggers onSubmit
                        className="create-account" 
                        disabled={loading}
                    >
                        {loading ? "Verifying..." : "Create Account"}
                    </button>
                )}
                
                <div className="already-div">
                    <p className="already">Already have an account?</p>
                    <Link to="/login">
                        <button className="already-btn">Login</button>
                    </Link>
                </div>
            </form>
        </div>
        </>
    )
}

export default SignUp;





