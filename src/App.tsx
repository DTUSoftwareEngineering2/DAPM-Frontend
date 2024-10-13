import { ThemeProvider, createTheme } from "@mui/material";
import "./index.css";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "./redux/slices";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // defaults to localStorage for web
import PipelineComposer from "./routes/PipeLineComposer";
import UserPage from "./routes/OverviewPage";
import { loadState, saveState } from "./redux/browser-storage";
import Register from "./components/Auth/Register";
import Login from "./components/Auth/Login";
import { AuthProvider } from "./context/AuthProvider";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import RequireAuth from "./components/Auth/RequireAuth";

// Configure redux-persist
const persistConfig = {
  key: "root",
  storage,
};

const persistedReducer = persistReducer<ReturnType<typeof rootReducer>>(
  persistConfig,
  rootReducer
);

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

const store = configureStore({
  reducer: persistedReducer,
  preloadedState: loadState(),
});

// here we subscribe to the store changes
store.subscribe(
  // we use debounce to save the state once each 800ms
  // for better performances in case multiple changes occur in a short time
  () => saveState(store.getState())
);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <div className="App">
        <Provider store={store}>
          <AuthProvider>
            <Routes>
              {/* Public routes */}
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />

              {/* Protected routes */}
              <Route element={<RequireAuth />}>
                <Route path="/" element={<UserPage />} />
                <Route path="pipeline" element={<PipelineComposer />} />
              </Route>
            </Routes>
          </AuthProvider>
        </Provider>
      </div>
    </ThemeProvider>
  );
}
