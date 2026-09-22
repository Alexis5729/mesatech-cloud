import {BrowserRouter, Routes, Route, Navigate,} from "react-router-dom";

import { useIsAuthenticated } from "@azure/msal-react";

import Login from "./pages/login";
import Home from "./pages/Home";


function ProtectedRoute({ children }) {

  const isAuthenticated =
    useIsAuthenticated();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}


function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* LOGIN */}
        <Route
          path="/"
          element={<Login />}
        />

        {/* HOME PROTEGIDO */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;