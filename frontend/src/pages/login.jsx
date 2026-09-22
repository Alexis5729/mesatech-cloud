import { useState } from "react";
import {useMsal, useIsAuthenticated,} from "@azure/msal-react";
import {InteractionStatus, InteractionRequiredAuthError,} from "@azure/msal-browser";
import { useNavigate } from "react-router-dom";
import { loginRequest } from "../auth/msalConfig";
import "./login.css";


function Login() {

  const {
    instance,
    accounts,
    inProgress,
  } = useMsal();

  const isAuthenticated = useIsAuthenticated();

  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [tokenObtained, setTokenObtained] = useState(false);


  // Usuario autenticado
  const account = accounts[0];

  // OBTENER ACCESS TOKEN

  const getAccessToken = async (userAccount) => {

    try {

      const tokenResponse =
        await instance.acquireTokenSilent({
          ...loginRequest,
          account: userAccount,
        });

      console.log("Access Token obtenido correctamente");

      setTokenObtained(true);

      return tokenResponse.accessToken;

    } catch (error) {

      console.log(
        "Se requiere interacción para obtener el token."
      );

      if (
        error instanceof InteractionRequiredAuthError
      ) {

        try {

          const tokenResponse =
            await instance.acquireTokenPopup(
              loginRequest
            );

          console.log(
            "Access Token obtenido mediante popup"
          );

          setTokenObtained(true);

          return tokenResponse.accessToken;

        } catch (popupError) {

          console.error(
            "Error obteniendo Access Token:",
            popupError
          );

          setError(
            "No fue posible obtener el Access Token."
          );

          return null;
        }

      } else {

        console.error(
          "Error obteniendo Access Token:",
          error
        );

        setError(
          "No fue posible obtener el Access Token."
        );

        return null;
      }
    }
  };

  // LOGIN
  

  const handleLogin = async (event) => {

    event.preventDefault();

    setError("");
    setLoading(true);
    setTokenObtained(false);


    if (
      inProgress !== InteractionStatus.None
    ) {

      setLoading(false);

      return;
    }


    try {

      // Login con Microsoft
      const response =
        await instance.loginPopup(
          loginRequest
        );


      // Establecer cuenta activa
      instance.setActiveAccount(
        response.account
      );


      console.log(
        "================================"
      );

      console.log(
        "LOGIN EXITOSO"
      );

      console.log(
        "Nombre:",
        response.account.name
      );

      console.log(
        "Correo:",
        response.account.username
      );

      console.log(
        "Claims:",
        response.account.idTokenClaims
      );

      console.log(
        "================================"
      );


      // Obtener Access Token
      const token =
        await getAccessToken(
          response.account
        );


      if (!token) {

        setError(
          "El inicio de sesión fue correcto, pero no se pudo obtener el Access Token."
        );

        return;
      }


      console.log(
        "Usuario autenticado correctamente."
      );
    navigate("/home");


    } catch (error) {

      console.error(
        "Error de login:",
        error
      );

      setError(
        "No fue posible iniciar sesión con Microsoft. Inténtalo nuevamente."
      );

    } finally {

      setLoading(false);

    }
  };


  // LOGOUT


  const handleLogout = async () => {

    setError("");
    setTokenObtained(false);

    try {

      await instance.logoutPopup();

    } catch (error) {

      console.error(
        "Error al cerrar sesión:",
        error
      );

      setError(
        "No fue posible cerrar la sesión."
      );
    }
  };

  // INTERFAZ
  

  return (

    <div className="login-page">

      <div className="login-container">


        {/* ENCABEZADO */}

        <div className="login-header">

          <h1>
            MESATECH CLOUD
          </h1>

          <p>
            Sistema ERP para PYMEs
          </p>

        </div>
        


        {/* 
            USUARIO NO AUTENTICADO */}

        {!isAuthenticated && (

          <div className="login-card">

            <h2>
              Iniciar sesión
            </h2>

            <p className="login-subtitle">
              Ingresa con tu cuenta corporativa de Microsoft
            </p>


            <form onSubmit={handleLogin}>

              <button
                type="submit"
                className="login-button"
                disabled={
                  loading ||
                  inProgress !==
                    InteractionStatus.None
                }
              >

                {loading
                  ? "Iniciando sesión..."
                  : "Iniciar sesión con Microsoft"}

              </button>


              {error && (

                <p className="error-message">
                  {error}
                </p>

              )}

            </form>

          </div>

        )}


        {/* 
            USUARIO AUTENTICADO */}

        {isAuthenticated && account && (

          <div className="login-card">

            <h2>
              Bienvenido
            </h2>

            <p className="login-subtitle">
              Has iniciado sesión correctamente
            </p>


            <div className="authenticated-user">

              <p>
                <strong>
                  Nombre:
                </strong>{" "}
                {account.name}
              </p>


              <p>
                <strong>
                  Correo:
                </strong>{" "}
                {account.username}
              </p>


              {/* CLAIM */}

              <p>
                <strong>
                  Claim:
                </strong>{" "}
                {account.idTokenClaims
                  ?.preferred_username ||
                  account.idTokenClaims
                    ?.email ||
                  "No disponible"}
              </p>

            </div>


            {/* TOKEN */}

            <div className="token-status">

              {tokenObtained ? (

                <p>
                   Access Token obtenido
                </p>

              ) : (

                <p>
                  Access Token no disponible
                </p>

              )}

            </div>


            {/* ERROR */}

            {error && (

              <p className="error-message">
                {error}
              </p>

            )}


            {/* LOGOUT */}

            <button
              type="button"
              className="login-button"
              onClick={handleLogout}
            >
              Cerrar sesión
            </button>

          </div>

        )}


        {/* 
            FIRMA */}

        <footer className="developer-signature">

          Desarrollado por Alexis Poblete, Damian Villanueva y Francisco Vásquez | Sistema creado para la asignatura de Desarrollo Cloud Native 2026

        </footer>


      </div>

    </div>
  );
}


export default Login;