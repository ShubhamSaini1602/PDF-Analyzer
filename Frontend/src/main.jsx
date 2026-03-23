// main.jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router";
import { Provider } from "react-redux";
import { store } from "./CentralStore/store";
import axiosClient from "./utils/axiosClient";
import { forceLogout } from "./CentralStore/authSlice";

// === ADD THIS INTERCEPTOR LOGIC ===
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // If the error status is 401 (Unauthorized), it means the token expired
    if (error.response && error.response.status === 401) {
      // Dispatch the logout action directly to the store
      store.dispatch(forceLogout());
    }
    return Promise.reject(error);
  }
);
// ==================================

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </Provider>
  </StrictMode>,
);