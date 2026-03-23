// authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosClient from "../utils/axiosClient";

export const sendOtp = createAsyncThunk(
    "auth/sendOtp",
    async (emailId, thunkAPI) => {
        try{
            // We send emailId to the backend
            const response = await axiosClient.post("/user/send-otp", { emailId });
            return response.data.message;
        } 
        catch(error){
            return thunkAPI.rejectWithValue(error.message); 
        }
    }
);

export const registerUser = createAsyncThunk(
    "auth/registerUser",
    async(userData, thunkAPI) => {
        try{
            const response = await axiosClient.post("/user/register", userData);
            return response.data.user;
        }
        catch(error){
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);

export const loginUser = createAsyncThunk(
    "auth/login",
    async(credentials, thunkAPI) => {
        try{
            const response = await axiosClient.post("/user/login", credentials);
            return response.data.user;
        }
        catch(error){
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);

// Persistent Login with token-based authentication
export const checkAuth = createAsyncThunk(
    "auth/checkAuth",
    // _ means --> no args
    async(_, thunkAPI) => {
        try{
            const response = await axiosClient.get("/user/checkAuth");
            return response.data.user;
        }
        catch(error){
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);

export const logoutUser = createAsyncThunk(
    "auth/logout",
    async(_, thunkAPI) => {
        try{
            await axiosClient.post("/user/logout");
            return null;
        }
        catch(error){
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);

export const googleAuth = createAsyncThunk(
    "auth/googleAuth",
    async (code, thunkAPI) => {
        try {
            const response = await axiosClient.post("/user/google-login", { code });
            return response.data.user;
        } 
        catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const githubAuth = createAsyncThunk(
    "auth/githubAuth",
    async (code, thunkAPI) => {
        try {
            const response = await axiosClient.post("/user/github-login", { code });
            return response.data.user;
        } 
        catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Contact Support Email Thunk
export const contactUs = createAsyncThunk(
    "auth/contactUs",
    async (contactData, thunkAPI) => {
        try {
            const response = await axiosClient.post("/user/contact-us", contactData);
            return response.data.message;
        } 
        catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data?.error || error.message);
        }
    }
);

const authSlice = createSlice({
    name: "auth",
    initialState: {
        user: null,
        isAuthenticated: false,
        loading: true,
        error: null,
        otpSent: false, // true = show OTP input, false = show normal form
        otpLoading: false, // A loading state specifically for our Verify Email Button
        contactLoading: false
    },

    reducers: {
        forceLogout: (state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.loading = false;
        },
        markProblemAsSolved: (state, action) => {
            const problemId = action.payload;
            // Check if user exists and if the problem ID is not already in the array
            if (state.user && state.user.problemsSolved) {
                if (!state.user.problemsSolved.includes(problemId)) {
                    state.user.problemsSolved.push(problemId);
                }
            }
        },
        updateUser: (state, action) => {
            state.user = action.payload; 
            state.isAuthenticated = true;
        }
    },

    extraReducers: (builder) => {
        builder
            // SEND OTP Cases
            .addCase(sendOtp.pending, (state) => {
                state.otpLoading = true;
                state.error = null;
            })
            .addCase(sendOtp.fulfilled, (state) => {
                state.otpLoading = false;
                state.otpSent = true; // true = show OTP input
            })
            .addCase(sendOtp.rejected, (state, action) => {
                state.otpLoading = false;
                state.otpSent = false;
                state.error = action.payload;
            })

            // Register User Cases
            .addCase(registerUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state,action) => {
                state.user = action.payload;
                // We don’t set it directly to true because there could be an edge case where the server 
                // returns null instead of the expected user data. In that case, the user shouldn’t be 
                // considered authenticated. Using !!action.payload smartly handles this — since !!null 
                // becomes false, isAuthenticated is automatically set to false.
                state.isAuthenticated = !!action.payload;
                state.loading = false;
                state.otpSent = false; // Reset the state of the otpSent variable
            })
            .addCase(registerUser.rejected, (state,action) => {
                state.user = null;
                state.isAuthenticated = false;
                state.loading = false;
                state.error = action.payload;
                // Note: We do NOT set otpSent to false here. 
                // If they typed the wrong OTP, we want them to stay on the OTP screen to try again.
            })

            // Login User cases
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state,action) => {
                state.user = action.payload;
                state.isAuthenticated = !!action.payload;
                state.loading = false;
            })
            .addCase(loginUser.rejected, (state,action) => {
                state.user = null;
                state.isAuthenticated = false;
                state.loading = false;
                state.error = action.payload;
            })

            // Check Authorization Cases
            .addCase(checkAuth.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(checkAuth.fulfilled, (state,action) => {
                state.user = action.payload;
                state.isAuthenticated = !!action.payload;
                state.loading = false;
            })
            .addCase(checkAuth.rejected, (state,action) => {
                state.user = null;
                state.isAuthenticated = false;
                state.loading = false;
                state.error = action.payload;
            })

            // Logout User Cases
            .addCase(logoutUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(logoutUser.fulfilled, (state) => {
                state.user = null;
                state.isAuthenticated = false;
                state.loading = false;
            })
            .addCase(logoutUser.rejected, (state,action) => {
                state.user = null;
                state.isAuthenticated = false;
                state.loading = false;
                state.error = action.payload;
            })

            // GOOGLE AUTH CASES
            .addCase(googleAuth.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(googleAuth.fulfilled, (state, action) => {
                state.user = action.payload;
                state.isAuthenticated = !!action.payload;
                state.loading = false;
            })
            .addCase(googleAuth.rejected, (state, action) => {
                state.loading = false;
                state.isAuthenticated = false;
                state.error = action.payload;
            })

            // GITHUB AUTH CASES (SAME AS GOOGLE AUTH CASES)
            .addCase(githubAuth.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(githubAuth.fulfilled, (state, action) => {
                state.user = action.payload;
                state.isAuthenticated = !!action.payload;
                state.loading = false;
            })
            .addCase(githubAuth.rejected, (state, action) => {
                state.loading = false;
                state.isAuthenticated = false;
                state.error = action.payload;
            })

            // Contact Us Cases 
            .addCase(contactUs.pending, (state, action) => {
                state.contactLoading = true;
                state.error = null;
            })
            .addCase(contactUs.fulfilled, (state, action) => {
                state.contactLoading = false;
            })
            .addCase(contactUs.rejected, (state, action) => {
                state.contactLoading = false;
                state.error = action.payload;
            });
    }
});

export const { forceLogout, markProblemAsSolved, updateUser } = authSlice.actions;
export default authSlice.reducer;


