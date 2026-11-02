import { useEffect, useState } from "react";
import { useMsal } from "@azure/msal-react";
import { InteractionStatus } from "@azure/msal-browser";
import { useNavigate } from "react-router-dom";
import { useUserRoles } from "../hooks/useUserRoles";
import { loginRequest } from "../auth/msalConfig";
import "./Home.css";

import logo from "../assets/mesatech-logo.png";

import {
  Home as HomeIcon,
  ClipboardList,
  PlusCircle,
  BookOpen,
  Monitor,
  MonitorCog,
  Network,
  KeyRound,
  LogOut,
  Settings,
  Sun,
  Moon,
  Bell,
  ChevronDown,
  Clock3,
  CheckCircle2,
  BarChart3,
  UserRoundCog,
  Menu,
  X,
} from "lucide-react";


function Home() {

  const {
    instance,
    accounts,
    inProgress,
  } = useMsal();

  const navigate = useNavigate();


  /* =====================================================
     CUENTA ACTIVA
  ===================================================== */

  const [account, setAccount] = useState(() =>
    instance.getActiveAccount() ||
    accounts[0] ||
    null
  );


  const {
    esCliente,
    esOperador,
    esAdministrador,
  } = useUserRoles(account);


  const nombre =
    account?.name || "Usuario";

  const correo =
    account?.username || "Sin correo";

  const primerNombre =
    nombre.split(" ")[0];


  const rol =
    esAdministrador
      ? "Administrador"
      : esOperador
        ? "Operador"
        : esCliente
          ? "Cliente"
          : "Usuario";


  /* =====================================================
     PERFIL
  ===================================================== */

  const [showProfileMenu, setShowProfileMenu] =
    useState(false);


  /* =====================================================
     SIDEBAR
  ===================================================== */

  const [sidebarOpen, setSidebarOpen] =
    useState(false);


  const closeSidebar = () => {
    setSidebarOpen(false);
  };


  const goTo = (route) => {

    navigate(route);

    closeSidebar();

  };


  /*
   * Cerrar sidebar con ESC.
   */
  useEffect(() => {

    const handleKeyDown = (event) => {

      if (
        event.key === "Escape" &&
        sidebarOpen
      ) {
        setSidebarOpen(false);
      }

    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {

      window.removeEventListener(
        "keydown",
        handleKeyDown
      );

    };

  }, [sidebarOpen]);


  /*
   * Evitar scroll del fondo cuando
   * el menú lateral está abierto.
   */
  useEffect(() => {

    if (sidebarOpen) {

      document.body.style.overflow =
        "hidden";

    } else {

      document.body.style.overflow =
        "";

    }

    return () => {
      document.body.style.overflow = "";
    };

  }, [sidebarOpen]);


  /* =====================================================
     TEMA LIGHT / DARK
  ===================================================== */

  const [theme, setTheme] = useState(() => {

    const savedTheme =
      localStorage.getItem(
        "mesatech-theme"
      );


    if (
      savedTheme === "light" ||
      savedTheme === "dark"
    ) {

      return savedTheme;

    }


    return "light";

  });


  useEffect(() => {

    localStorage.setItem(
      "mesatech-theme",
      theme
    );

  }, [theme]);


  const toggleTheme = () => {

    setTheme((currentTheme) =>
      currentTheme === "light"
        ? "dark"
        : "light"
    );

  };


  /* =====================================================
     LOGOUT
  ===================================================== */

  const handleLogout = async () => {

    if (
      inProgress !==
      InteractionStatus.None
    ) {
      return;
    }


    setShowProfileMenu(false);
    setSidebarOpen(false);


    try {

      await instance.logoutPopup({
        mainWindowRedirectUri: "/",
      });

    } catch (error) {

      console.error(
        "Error al cerrar sesión:",
        error
      );

    }

  };


  /* =====================================================
     CAMBIAR USUARIO
  ===================================================== */

  const handleSwitchAccount =
    async () => {

      if (
        inProgress !==
        InteractionStatus.None
      ) {
        return;
      }


      setShowProfileMenu(false);


      try {

        const response =
          await instance.loginPopup({
            ...loginRequest,
            prompt: "select_account",
          });


        if (!response?.account) {
          return;
        }


        /*
         * Cuenta activa para MSAL.
         */
        instance.setActiveAccount(
          response.account
        );


        /*
         * Cuenta activa para React.
         */
        setAccount(
          response.account
        );


      } catch (error) {

        console.error(
          "Error al cambiar de usuario:",
          error
        );

      }

    };


  /* =====================================================
     INTERFAZ
  ===================================================== */

  return (

    <div
      className="dashboard-page"
      data-theme={theme}
    >

      {/* =================================================
          SIDEBAR DRAWER
      ================================================= */}

      <aside
        className={
          sidebarOpen
            ? "dashboard-sidebar open"
            : "dashboard-sidebar"
        }
      >


        {/* CERRAR */}

        <button
          type="button"
          className="sidebar-close-button"
          onClick={closeSidebar}
          aria-label="Cerrar menú"
        >

          <X size={22}/>

        </button>


        {/* LOGO */}

        <div className="sidebar-brand">

          <img
            src={logo}
            alt="MesaTech Cloud"
          />

        </div>


        {/* NAVEGACIÓN */}

        <nav className="sidebar-navigation">


          <button
            type="button"
            className="sidebar-item active"
            onClick={() =>
              goTo("/home")
            }
          >

            <HomeIcon size={21}/>

            <span>
              Inicio
            </span>

          </button>


          <button
            type="button"
            className="sidebar-item"
            onClick={() =>
              goTo("/solicitudes")
            }
          >

            <ClipboardList size={21}/>

            <span>
              Solicitudes
            </span>

          </button>


          <button
            type="button"
            className="sidebar-item"
            onClick={() =>
              goTo("/nueva-solicitud")
            }
          >

            <PlusCircle size={21}/>

            <span>
              Nueva solicitud
            </span>

          </button>


          <button
            type="button"
            className="sidebar-item"
            onClick={() =>
              goTo("/catalogo")
            }
          >

            <BookOpen size={21}/>

            <span>
              Catálogo
            </span>

          </button>


          {esAdministrador && (

            <>

              <div className="sidebar-divider"/>


              <div className="sidebar-section">

                <Settings size={20}/>

                <span>
                  Administración
                </span>

              </div>

            </>

          )}

        </nav>


        {/* ONDAS */}

        <div className="sidebar-wave wave-a"/>

        <div className="sidebar-wave wave-b"/>

      </aside>


      {/* =================================================
          OVERLAY
      ================================================= */}

      {sidebarOpen && (

        <button
          type="button"
          className="sidebar-overlay"
          onClick={closeSidebar}
          aria-label="Cerrar menú lateral"
        />

      )}


      {/* =================================================
          ÁREA PRINCIPAL
      ================================================= */}

      <div className="dashboard-main">


        {/* =================================================
            HEADER
        ================================================= */}

        <header className="dashboard-header">


          {/* HAMBURGUESA */}

          <button
            type="button"
            className="menu-button"
            onClick={() =>
              setSidebarOpen(true)
            }
            aria-label="Abrir menú"
          >

            <Menu size={23}/>

          </button>


          <div className="header-spacer"/>


          <div className="header-actions">


            {/* NOTIFICACIONES */}

            <button
              type="button"
              className="header-icon-button"
              aria-label="Notificaciones"
            >

              <Bell size={19}/>

            </button>


            {/* LIGHT / DARK */}

            <button
              type="button"
              className="theme-switch"
              onClick={toggleTheme}
              aria-label={
                theme === "light"
                  ? "Cambiar a modo oscuro"
                  : "Cambiar a modo claro"
              }
            >


              <span
                className={
                  theme === "light"
                    ? "theme-option active"
                    : "theme-option"
                }
              >

                <Sun size={16}/>

              </span>


              <span
                className={
                  theme === "dark"
                    ? "theme-option active"
                    : "theme-option"
                }
              >

                <Moon size={16}/>

              </span>

            </button>


            <div className="header-divider"/>


            {/* PERFIL */}

            <div className="profile-container">


              <button
                type="button"
                className="user-area"
                onClick={() =>
                  setShowProfileMenu(
                    !showProfileMenu
                  )
                }
              >


                <div className="user-info">

                  <strong>
                    {nombre}
                  </strong>

                  <span>
                    {correo}
                  </span>

                </div>


                <div className="user-avatar">

                  {nombre
                    .charAt(0)
                    .toUpperCase()}

                </div>


                <ChevronDown
                  size={16}
                  className="profile-chevron"
                />

              </button>


              {showProfileMenu && (

                <div className="profile-menu">


                  <div className="profile-menu-info">

                    <strong>
                      {nombre}
                    </strong>

                    <span>
                      {correo}
                    </span>

                    <small>
                      {rol}
                    </small>

                  </div>


                  <div className="profile-menu-divider"/>


                  <button
                    type="button"
                    className="switch-account-button"
                    onClick={handleSwitchAccount}
                  >

                    <UserRoundCog size={18}/>

                    <span>
                      Cambiar de usuario
                    </span>

                  </button>


                  <div className="profile-menu-divider"/>


                  <button
                    type="button"
                    className="logout-button"
                    onClick={handleLogout}
                  >

                    <LogOut size={18}/>

                    <span>
                      Cerrar sesión
                    </span>

                  </button>

                </div>

              )}

            </div>

          </div>

        </header>


        {/* =================================================
            CONTENIDO
        ================================================= */}

        <main className="dashboard-content">


          {/* =================================================
              BIENVENIDA
          ================================================= */}

          <section className="dashboard-welcome">


            <div className="welcome-copy">

              <span className="welcome-label">
                PANEL PRINCIPAL
              </span>


              <h1>
                Hola, {primerNombre}
              </h1>


              <p className="welcome-role">
                Rol: {rol}
              </p>


              <p className="welcome-description">

                Gestiona tus solicitudes de soporte
                de manera rápida y sencilla.

              </p>

            </div>


            <div className="welcome-cloud">

              <div className="cloud-shape cloud-one"/>

              <div className="cloud-shape cloud-two"/>

            </div>

          </section>


          {/* =================================================
              MÉTRICAS
          ================================================= */}

          <section className="summary-grid">


            <article className="summary-card">

              <div className="summary-icon blue">

                <ClipboardList size={24}/>

              </div>

              <div>

                <strong>
                  —
                </strong>

                <span>
                  Solicitudes totales
                </span>

              </div>

            </article>


            <article className="summary-card">

              <div className="summary-icon orange">

                <Clock3 size={24}/>

              </div>

              <div>

                <strong>
                  —
                </strong>

                <span>
                  En gestión
                </span>

              </div>

            </article>


            <article className="summary-card">

              <div className="summary-icon green">

                <CheckCircle2 size={24}/>

              </div>

              <div>

                <strong>
                  —
                </strong>

                <span>
                  Resueltas
                </span>

              </div>

            </article>


            <article className="summary-card">

              <div className="summary-icon purple">

                <BarChart3 size={24}/>

              </div>

              <div>

                <strong>
                  —
                </strong>

                <span>
                  Tasa de resolución
                </span>

              </div>

            </article>

          </section>


          {/* =================================================
              ACCIONES
          ================================================= */}

          <section className="dashboard-section">


            <h2>
              ¿Qué deseas hacer?
            </h2>


            <div className="action-grid">


              <button
                type="button"
                className="action-card"
                onClick={() =>
                  navigate("/solicitudes")
                }
              >

                <div className="action-icon blue">

                  <ClipboardList size={25}/>

                </div>


                <div className="action-text">

                  <h3>

                    {esCliente
                      ? "Mis solicitudes"
                      : "Gestionar solicitudes"}

                  </h3>


                  <p>

                    {esCliente
                      ? "Consulta el estado de tus solicitudes de soporte."
                      : "Consulta y gestiona las solicitudes de soporte."}

                  </p>

                </div>


                <span className="action-arrow">
                  →
                </span>

              </button>


              <button
                type="button"
                className="action-card"
                onClick={() =>
                  navigate("/nueva-solicitud")
                }
              >

                <div className="action-icon green">

                  <PlusCircle size={25}/>

                </div>


                <div className="action-text">

                  <h3>
                    Nueva solicitud
                  </h3>

                  <p>
                    Registra una nueva solicitud de soporte.
                  </p>

                </div>


                <span className="action-arrow">
                  →
                </span>

              </button>


              <button
                type="button"
                className="action-card"
                onClick={() =>
                  navigate("/catalogo")
                }
              >

                <div className="action-icon purple">

                  <BookOpen size={25}/>

                </div>


                <div className="action-text">

                  <h3>
                    Catálogo
                  </h3>

                  <p>
                    Consulta las categorías disponibles.
                  </p>

                </div>


                <span className="action-arrow">
                  →
                </span>

              </button>

            </div>

          </section>


          {/* =================================================
              CATEGORÍAS
          ================================================= */}

          <section className="dashboard-section categories-section">


            <div className="section-header">


              <div>

                <h2>
                  Categorías disponibles
                </h2>

                <p>

                  Tipos de soporte disponibles
                  en MesaTech Cloud.

                </p>

              </div>


              <button
                type="button"
                className="catalog-button"
                onClick={() =>
                  navigate("/catalogo")
                }
              >

                Ver catálogo

                <span>
                  →
                </span>

              </button>

            </div>


            <div className="category-grid">


              <article className="category-card">

                <div className="category-icon">

                  <Monitor size={27}/>

                </div>

                <div>

                  <h3>
                    Hardware
                  </h3>

                  <p>
                    Equipos y componentes
                  </p>

                </div>

              </article>


              <article className="category-card">

                <div className="category-icon">

                  <MonitorCog size={27}/>

                </div>

                <div>

                  <h3>
                    Software
                  </h3>

                  <p>
                    Aplicaciones y sistemas
                  </p>

                </div>

              </article>


              <article className="category-card">

                <div className="category-icon">

                  <Network size={27}/>

                </div>

                <div>

                  <h3>
                    Redes
                  </h3>

                  <p>
                    Conectividad y comunicaciones
                  </p>

                </div>

              </article>


              <article className="category-card">

                <div className="category-icon">

                  <KeyRound size={27}/>

                </div>

                <div>

                  <h3>
                    Accesos
                  </h3>

                  <p>
                    Usuarios y permisos
                  </p>

                </div>

              </article>

            </div>

          </section>


          <footer className="dashboard-footer">

            Desarrollado por Alexis Poblete y Damian Villanueva

            {" | "}

            Desarrollo Cloud Native 2026

          </footer>


        </main>

      </div>

    </div>

  );

}

export default Home;