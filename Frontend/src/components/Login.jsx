import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Aurora from "../components/Aurora";
// ----------------
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from '../CentralStore/authSlice';
import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Link } from 'react-router';
import getGoogleUrl from "../utils/getGoogleUrl";
import getGitHubUrl from "../utils/getGitHubUrl";

const passwordValidation = {
    // Creating a Regular Expression Pattern
    uppercase: new RegExp(/[A-Z]/),
    lowercase: new RegExp(/[a-z]/),
    number: new RegExp(/[0-9]/),
    specialChar: new RegExp(/[^A-Za-z0-9]/),
};

// Validation Rules
const signupSchema = z.object({
  emailId: z.email("Please enter a valid email address."),
  // z.regex() is used with strings to ensure that the given Regular Expression pattern
  // is found in the string
  password: z.string().min(8, "Password must be at least 8 characters long.")
    .regex(passwordValidation.uppercase, "Must contain one uppercase letter.")
    .regex(passwordValidation.lowercase, "Must contain one lowercase letter.")
    .regex(passwordValidation.number, "Must contain one number.")
    .regex(passwordValidation.specialChar, "Must contain one special character.")
});

function Login(){
    const dispatch = useDispatch();
    const {isAuthenticated} = useSelector((state) => state.auth);
    const navigate = useNavigate();
    // ----------------------------------------

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({resolver: zodResolver(signupSchema)});
    // ----------------------------------------
    
    // Redundant — not functionally needed, kept only as a safety measure
    useEffect(() => {
        if(isAuthenticated){
            navigate("/");
        }
    }, [isAuthenticated]);
    
    const onSubmit = (data) => {
        dispatch(loginUser(data));
    }

    // Handle Google Redirect
    const handleGoogleLogin = () => {
        window.location.href = getGoogleUrl();
    };

    // Handle GitHub Redirect
    const handleGitHubLogin = () => {
        window.location.href = getGitHubUrl();
    };

    return (
        <>
        <Aurora
            colorStops={["#3730a3", "#86198f", "#155e75"]}
            blend={1}
            amplitude={1}
            speed={0.5}
        />

        <div className="login-container">
            <form onSubmit={handleSubmit(onSubmit)} className="form2">
                <h2 className="form-heading">Login to ByteRank</h2>
                {/* Always Wrap your label,input,error and icon inside a div */}
                <div className="form-element">
                    <label className="form-label">Email</label>
                    <input
                        type="email"
                        placeholder="Enter your Email"
                        className={`form-input ${errors.emailId ? "border-red" : ""}`}
                        {...register("emailId")}
                    />
                    {errors.emailId && (
                        <>
                        <p className="form-error">{errors.emailId.message}</p>
                        </>
                    )}
                    <i className="ri-mail-fill form-icon"></i>
                </div>
                {/* ----------------------- */}
                <div className="form-element">
                    <label className="form-label">Password</label>
                    <input
                        type="password"
                        placeholder="Enter your password"
                        className="form-input"
                        {...register("password")}
                    />
                    {errors.password && (
                        <p className="form-error">{errors.password.message}</p>
                    )}
                    <i className="ri-lock-fill form-icon"></i>
                </div>
                {/* ------------------------------------- */}

                <button type="submit" className="login-btn">Login</button>

                {/* --- GOOGLE AND GITHUB BUTTONS --- */}
                <div style={{ marginTop: '15px', width: '100%' }}>
                    <div style={{display: 'flex', alignItems: 'center', margin: '15px 0'}}>
                        <div style={{flex: 1, height: '1px', background: '#334155'}}></div>
                        <span style={{padding: '0 10px', color: '#94a3b8', fontSize: '14px', fontFamily: 'Figtree'}}>OR</span>
                        <div style={{flex: 1, height: '1px', background: '#334155'}}></div>
                    </div>

                    {/* GOOGLE BUTTON */}
                    <button 
                        type="button" // Important: type="button" to prevent form submit
                        onClick={handleGoogleLogin}
                        className='google-sign-in-btn'
                    >
                        {/* Google SVG Icon */}
                        <svg width="20" height="20" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Sign in with Google
                    </button>

                    {/* GITHUB BUTTON */}
                    <button 
                        type="button" // Important: type="button" to prevent form submit
                        onClick={handleGitHubLogin}
                        className='github-sign-in-btn'
                    >
                        <i className="ri-github-fill" style={{fontSize: '22px'}}></i>
                        Sign in with GitHub
                    </button>
                </div>

                <div className="already-div">
                    <p className="already">Don’t have an account?</p>
                    <Link to="/SignUp">
                        <button className="already-btn">SignUp</button>
                    </Link>
                </div>
            </form>
        </div>
        </>
    )
}

export default Login;