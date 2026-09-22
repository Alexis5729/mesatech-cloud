import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { useIsAuthenticated } from "@azure/msal-react";

import Login from "./pages/Login";
import Home from "./pages/Home";
import Solicitudes from "./pages/Solicitudes";
import NuevaSolicitud from "./pages/NuevaSolicitud";
import Catalogo from "./pages/Catalogo";


// ==========================================
// RUTA PROTEGIDA
// ==========================================

function ProtectedRoute({ children }) {
  const isAuthenticated = useIsAuthenticated();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}


// ==========================================
// APP
// ==========================================

function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* ==================================
            LOGIN
        ================================== */}

        <Route
          path="/"
          element={<Login />}
        />


        {/* ==================================
            HOME
        ================================== */}

        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />


        {/* ==================================
            MIS SOLICITUDES
        ================================== */}

        <Route
          path="/solicitudes"
          element={
            <ProtectedRoute>
              <Solicitudes />
            </ProtectedRoute>
          }
        />


        {/* ==================================
            NUEVA SOLICITUD
        ================================== */}

        <Route
          path="/nueva-solicitud"
          element={
            <ProtectedRoute>
              <NuevaSolicitud />
            </ProtectedRoute>
          }
        />


        {/* ==================================
            CATÁLOGO
        ================================== */}

        <Route
          path="/catalogo"
          element={
            <ProtectedRoute>
              <Catalogo />
            </ProtectedRoute>
          }
        />


        {/* ==================================
            RUTA NO EXISTENTE
        ================================== */}

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;