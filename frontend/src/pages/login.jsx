import { useState } from "react";
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "../auth/msalConfig";
import "./Login.css";

function Login() {
  const { instance } = useMsal();

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      // Iniciar sesión con Microsoft
      const response = await instance.loginPopup(loginRequest);

      // Guardar la cuenta como cuenta activa
      instance.setActiveAccount(response.account);

      console.log("Usuario autenticado:");
      console.log(response.account);

      console.log("Nombre:", response.account.name);
      console.log("Correo:", response.account.username);

      // Aquí posteriormente podemos redirigir al Home
      // navigate("/home");

    } catch (error) {
      console.error("Error de login:", error);

      setError(
        "No fue posible iniciar sesión con Microsoft. Inténtalo nuevamente."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      <div className="login-container">

        {/* ENCABEZADO */}

        <div className="login-header">
          <h1>MESATECH CLOUD</h1>

          <p>
            Sistema ERP para PYMEs
          </p>
        </div>

        {/* TARJETA LOGIN */}

        <div className="login-card">

          <h2>Iniciar sesión</h2>

          <p className="login-subtitle">
            Ingresa con tu cuenta corporativa de Microsoft
          </p>

          <form onSubmit={handleLogin}>

            {/* BOTÓN MICROSOFT */}

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading
                ? "Iniciando sesión..."
                : "Iniciar sesión con Microsoft"}
            </button>

            {/* ERROR */}

            {error && (
              <p className="error-message">
                {error}
              </p>
            )}

          </form>

        </div>
        <footer className="developer-signature">
  Desarrollado por Alexis Problete,Damian Iturra y Francisco Vásquez | Siatema creado para la asignatura de Desarrollo de cloud native 2026
</footer>

      </div>

    </div>
  );
}

export default Login;