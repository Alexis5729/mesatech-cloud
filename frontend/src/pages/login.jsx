import { useState } from "react";
import "./Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    // Limpiar errores anteriores
    setEmailError("");
    setPasswordError("");

    let isValid = true;

    // Validar correo
    if (email.trim() === "") {
      setEmailError("El correo electrónico es obligatorio");
      isValid = false;
    }

    // Validar contraseña vacía
    if (password.trim() === "") {
      setPasswordError("La contraseña es obligatoria");
      isValid = false;
    }

    // Validar longitud de contraseña
    if (password.length > 0 && password.length < 6) {
      setPasswordError(
        "La contraseña debe tener al menos 6 caracteres"
      );
      isValid = false;
    }

    // Si hay errores, no continuar
    if (!isValid) {
      return;
    }

    // Por ahora solamente mostramos los datos en consola
    console.log("Email:", email);
    console.log("Password:", password);
    console.log("Formulario válido");
  };

  return (
    <div className="login-page">

      <div className="login-container">

        <div className="login-header">
          <h1>MESATECH CLOUD</h1>
          <p>Sistema ERP para PYMEs</p>
        </div>

        <div className="login-card">

          <h2>Iniciar sesión</h2>

          <p className="login-subtitle">
            Ingresa tus credenciales para continuar
          </p>

          <form onSubmit={handleSubmit}>

            {/* CORREO */}

            <div className="input-group">

              <label htmlFor="email">
                Correo electrónico
              </label>

              <input
                id="email"
                type="email"
                placeholder="ejemplo@empresa.cl"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />

              {emailError && (
                <p className="error-message">
                  {emailError}
                </p>
              )}

            </div>

            {/* CONTRASEÑA */}

            <div className="input-group">

              <label htmlFor="password">
                Contraseña
              </label>

              <input
                id="password"
                type="password"
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />

              {passwordError && (
                <p className="error-message">
                  {passwordError}
                </p>
              )}

            </div>

            <button
              type="submit"
              className="login-button"
            >
              Iniciar sesión
            </button>

          </form>

        </div>

      </div>

    </div>
  );
}

export default Login;