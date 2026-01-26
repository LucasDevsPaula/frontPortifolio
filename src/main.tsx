import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { router } from "./App";
import "./index.css";
import { RouterProvider } from "react-router";
import { AuthProvider } from "./contexts/AuthContext";
import { Toaster } from "react-hot-toast";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
      <Toaster position="top-right" />
    </AuthProvider>
  </StrictMode>,
);
