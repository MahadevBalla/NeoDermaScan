import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Load tokens if they exist in localStorage
const tokensFromStorage = localStorage.getItem("authTokens")
    ? JSON.parse(localStorage.getItem("authTokens"))
    : null;

const initialState = {
    tokens: tokensFromStorage,
    user: null,
    isAuthenticated: !!tokensFromStorage,
    loading: false,
    error: null,
};

// LOGIN
export const login = createAsyncThunk(
    "auth/login",
    async ({ email, password, rememberMe }, { rejectWithValue }) => {
        try {
            const res = await fetch('/api/auth/login/', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.detail || "Invalid credentials");
            }

            const data = await res.json();

            // Store tokens based on rememberMe
            if (rememberMe) {
                localStorage.setItem("authTokens", JSON.stringify(data));
            } else {
                sessionStorage.setItem("authTokens", JSON.stringify(data));
            }

            return { ...data, rememberMe };
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

// SIGNUP
export const signup = createAsyncThunk(
    "auth/signup",
    async ({ full_name, email, phone_no, notification_preference, password, confirm_password, rememberMe }, { dispatch, rejectWithValue }) => {
        try {
            const res = await fetch('/api/auth/register/', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ full_name, email, phone_no, notification_preference, password, confirm_password }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(JSON.stringify(errorData));
            }
            // Automatically log in after signup
            await dispatch(login({ email, password, rememberMe }));
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

// FETCH PROFILE
export const fetchProfile = createAsyncThunk(
    "auth/fetchProfile",
    async (access, { rejectWithValue }) => {
        try {
            const res = await fetch('/api/profile/', {
                headers: { Authorization: `Bearer ${access}` },
            });
            if (!res.ok) throw new Error("Failed to fetch profile");
            return await res.json();
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

// REFRESH TOKEN
export const refreshToken = createAsyncThunk(
    "auth/refreshToken",
    async (refresh, { rejectWithValue }) => {
        try {
            const res = await fetch('api/auth/refresh/', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ refresh }),
            });
            if (!res.ok) throw new Error("Refresh failed");
            return await res.json();
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        logout: (state) => {
            state.tokens = null;
            state.user = null;
            state.isAuthenticated = false;
            localStorage.removeItem("authTokens");
            sessionStorage.removeItem("authTokens");
        },
    },
    extraReducers: (builder) => {
        builder
            // LOGIN
            .addCase(login.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.tokens = action.payload;
                state.isAuthenticated = true;
                state.loading = false;

                // Persist in storage based on rememberMe
                if (action.payload.rememberMe) {
                    localStorage.setItem("authTokens", JSON.stringify(action.payload));
                    sessionStorage.removeItem("authTokens");
                } else {
                    sessionStorage.setItem("authTokens", JSON.stringify(action.payload));
                    localStorage.removeItem("authTokens");
                }
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // SIGNUP
            .addCase(signup.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(signup.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(signup.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // FETCH PROFILE
            .addCase(fetchProfile.fulfilled, (state, action) => {
                state.user = action.payload;
            })
            // REFRESH TOKEN
            .addCase(refreshToken.fulfilled, (state, action) => {
                state.tokens = { ...state.tokens, access: action.payload.access };
                if (state.tokens?.rememberMe) {
                    localStorage.setItem("authTokens", JSON.stringify(state.tokens));
                }
            });
    },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
