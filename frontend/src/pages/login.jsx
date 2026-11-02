import { useState } from "react";
import {useMsal, useIsAuthenticated,} from "@azure/msal-react";
import {InteractionStatus, InteractionRequiredAuthError,} from "@azure/msal-browser";
import { useNavigate } from "react-router-dom";
import { loginRequest } from "../auth/msalConfig";
import "./login.css";
import logo from "../assets/mesatech-logo.png";


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


  const handleLogout = () => {

    setError("");
    setTokenObtained(false);

    instance.logoutRedirect({
      account: account,
      postLogoutRedirectUri: "/",
    });
  };

  // INTERFAZ

  return (

    <main className="login-page">
                <section className="login-shell">

                    {/* Logo compartido por ambos paneles */}
                    <div className="login-brand">
                        <img
                            src={logo}
                            alt="MesaTech Cloud"
                            className="login-logo"
                        />
                    </div>

                    {/* Panel izquierdo */}
                    <section className="login-info-panel">
                        <div className="login-info-content">
                            <h1>
                                Plataforma de{" "}
                                <span>mesa de ayuda</span>
                            </h1>

                            <p className="login-description">
                                Gestiona solicitudes, servicios y recursos de soporte TI
                                de forma eficiente y segura.
                            </p>

                            <div className="feature-list">

                                <article className="feature-item">
                                    <div className="feature-icon">
                                        <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.8"
                                        >
                                            <rect x="5" y="4" width="14" height="17" rx="2"/>
                                            <path d="M9 4V2h6v2"/>
                                            <path d="M9 9h6"/>
                                            <path d="M9 13h6"/>
                                            <path d="M9 17h4"/>
                                        </svg>
                                    </div>

                                    <div>
                                        <h2>Gestión de solicitudes</h2>
                                        <p>Registro, seguimiento y resolución.</p>
                                    </div>
                                </article>

                                <article className="feature-item">
                                    <div className="feature-icon">
                                        <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.8"
                                        >
                                            <path d="m12 3 9 5-9 5-9-5 9-5Z"/>
                                            <path d="m3 12 9 5 9-5"/>
                                            <path d="m3 16 9 5 9-5"/>
                                        </svg>
                                    </div>

                                    <div>
                                        <h2>Catálogo de servicios</h2>
                                        <p>Consulta de categorías y servicios.</p>
                                    </div>
                                </article>

                                <article className="feature-item">
                                    <div className="feature-icon">
                                        <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.8"
                                        >
                                            <rect x="9" y="2" width="6" height="6" rx="1"/>
                                            <rect x="2" y="16" width="6" height="6" rx="1"/>
                                            <rect x="16" y="16" width="6" height="6" rx="1"/>
                                            <path d="M12 8v4"/>
                                            <path d="M5 16v-2h14v2"/>
                                        </svg>
                                    </div>

                                    <div>
                                        <h2>Roles y accesos</h2>
                                        <p>Control de acceso con Microsoft Entra ID.</p>
                                    </div>
                                </article>

                                <article className="feature-item">
                                    <div className="feature-icon">
                                        <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.8"
                                        >
                                            <path d="M17.5 19H7a5 5 0 0 1-.5-9.97A7 7 0 0 1 20 11a4 4 0 0 1-2.5 8Z"/>
                                        </svg>
                                    </div>

                                    <div>
                                        <h2>Cloud Native</h2>
                                        <p>Arquitectura en AWS y RabbitMQ.</p>
                                    </div>
                                </article>

                            </div>
                        </div>

                        <div className="login-wave wave-one"/>
                        <div className="login-wave wave-two"/>
                    </section>

                    {/* Panel derecho */}
                    <section className="login-access-panel">
                        <div className="login-access-content">

                            <h2 className="welcome-title">
                                Bienvenido
                            </h2>

                            <p className="welcome-description">
                                Accede con tu cuenta corporativa
                                <br/>
                                de Microsoft
                            </p>

                            <button
                                type="button"
                                className="microsoft-login-button"
                                onClick={handleLogin}
                            >
                                <span className="microsoft-logo" aria-hidden="true">
                                    <span/>
                                    <span/>
                                    <span/>
                                    <span/>
                                </span>

                                <span>
                                    Iniciar sesión con Microsoft
                                </span>
                            </button>

                            <div className="login-information">
                                <div className="information-icon">
                                    i
                                </div>

                                <p>
                                    Usa tu cuenta institucional para
                                    <br/>
                                    acceder al sistema.
                                </p>
                            </div>

                        </div>
                    </section>

                </section>
            </main>
        );
    }

    export default Login;