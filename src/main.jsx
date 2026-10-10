
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import AdminRoute from "./AdminRoute.jsx";

const currentRoute = window.location.pathname.replace(/\/+$/, "") || "/";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {currentRoute === "/admin" ? <AdminRoute /> : <App />}
  </StrictMode>
);
