import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import Landing from "./pages/Landing";
import Students from "./pages/Students";
import Grades from "./pages/Grades";
import Subjects from "./pages/Subjects";
import Register from "./pages/Register";
import Portal from "./pages/Portal";
import { AuthProvider } from "./providers/AuthProvider";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Redirect root "/" to "/signup" */}
          <Route path="/" element={<Navigate to="/signup" replace />} />

          {/* Public routes */}
          <Route path="/signup" element={<Register />} />
          <Route path="/landing" element={<Landing />} />

          {/* Protected routes */}
          <Route path="/portal" element={<Portal />} />

          {/* Other app routes */}
          <Route path="/students" element={<Students />} />
          <Route path="/grades" element={<Grades />} />
          <Route path="/subjects" element={<Subjects />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
