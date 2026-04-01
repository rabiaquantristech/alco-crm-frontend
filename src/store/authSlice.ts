import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "@/types/apiType";

type AuthState = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
};

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      if (typeof window !== "undefined") {
        localStorage.setItem("token", action.payload.token);
        localStorage.setItem("user", JSON.stringify(action.payload.user));
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    },
    loadFromStorage: (state) => {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("token");
        const userStr = localStorage.getItem("user");
        if (token && userStr) {
          state.token = token;
          state.user = JSON.parse(userStr);
          state.isAuthenticated = true;
        }
      }
    },
  },
});

export const { setCredentials, logout, loadFromStorage } = authSlice.actions;
export default authSlice.reducer;

// import { createSlice, PayloadAction } from "@reduxjs/toolkit";
// import { User } from "@/types/apiType";

// type AuthState = {
//   user: User | null;
//   token: string | null;
//   isAuthenticated: boolean;
// };

// const storedUser =
//   typeof window !== "undefined"
//     ? localStorage.getItem("user")
//     : null;

// const storedToken =
//   typeof window !== "undefined"
//     ? localStorage.getItem("token")
//     : null;

// const initialState = {
//   user: storedUser ? JSON.parse(storedUser) : null,
//   token: storedToken || null,
//   isAuthenticated: !!storedToken,
// };

// const authSlice = createSlice({
//   name: "auth",
//   initialState,
//   reducers: {
//     setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
//       state.user = action.payload.user;
//       state.token = action.payload.token;
//       state.isAuthenticated = true;
//       localStorage.setItem("token", action.payload.token);
//       localStorage.setItem("user", JSON.stringify(action.payload.user));
//     },
//     logout: (state) => {
//       state.user = null;
//       state.token = null;
//       state.isAuthenticated = false;
//       localStorage.removeItem("token");
//       localStorage.removeItem("user");
//     },
//   },
// });

// export const { setCredentials, logout } = authSlice.actions;
// export default authSlice.reducer;