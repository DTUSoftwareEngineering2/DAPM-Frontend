import { ThemeProvider, createTheme } from "@mui/material";

import "./index.css";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "./redux/slices";

import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // defaults to localStorage for web
import {
  RouterProvider,
  createBrowserRouter,
  createHashRouter,
} from "react-router-dom";
import PipelineComposer from "./routes/PipeLineComposer";
import UserPage from "./routes/OverviewPage";
import { loadState, saveState } from "./redux/browser-storage";
import Register from "./routes/Register";
import Login from "./routes/Login";
import PrivateRoute from "./routes/PrivateRoute";
import { AuthProvider } from "./context/AuthProvider";
import { Button } from "@mui/material";
import { logout } from "./context/AuthProvider";
// Configure redux-persist
//test comment
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

const router = createBrowserRouter([
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/",
    element: (
      <PrivateRoute>
        <UserPage />
      </PrivateRoute>
    ),
  },
  {
    path: "/pipeline",
    element: (
      <PrivateRoute>
        <PipelineComposer />
      </PrivateRoute>
    ),
  },
  // {
  //   path: "/hello",
  //   element: <HelloPage />,
  // },
]);

export default function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <div className="App">
        <Provider store={store}>
          <AuthProvider>
            <RouterProvider router={router} />
          </AuthProvider>
        </Provider>
      </div>
    </ThemeProvider>
  );
}
