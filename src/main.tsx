import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { ToastContainer } from "react-toastify";
import SafeComponent from "./SafeComponent";

import "./index.css";
import "react-toastify/dist/ReactToastify.css";
import "../src/assets/css/Style.css";

// Custom error component example
const CustomErrorScreen = () => (
  <div className="error-screen">
    <h1 className="text-2xl font-bold text-red-600">Application Error</h1>
    <p>Please refresh the page or contact support</p>
    <button
      className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
      onClick={() => window.location.reload()}
    >
      Reload Application
    </button>
  </div>
);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ToastContainer position="bottom-right" autoClose={3000} />
    <SafeComponent fallback={<CustomErrorScreen />}>
      <App />
    </SafeComponent>
  </StrictMode>,
);
