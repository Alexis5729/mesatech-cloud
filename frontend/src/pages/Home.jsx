import { useMsal } from "@azure/msal-react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

function Home() {
  const { accounts } = useMsal();
  const navigate = useNavigate();

  const account = accounts[0];

  const nombre =
    account?.name || "Usuario";

  const correo =
    account?.username || "Sin correo";

  return (
    <div className="home-page">

      {/* 
          HEADER
       */}

      <header className="home-header">

        <div className="brand">
          <div className="brand-icon">
            M
          </div>

          <div>
            <h1>MesaTech Cloud</h1>
            <span>Gestión de soporte</span>
          </div>
        </div>
      


        <div className="user-area">

          <div className="user-info">

            <strong>
              {nombre}
            </strong>

            <span>
              {correo}
            </span>
            </div>
            
            

          <div className="user-avatar">
            {nombre.charAt(0).toUpperCase()}
          </div>

        </div>

      </header>


      {/* 
          CONTENIDO
       */}

      <main className="home-content">

        {/* BIENVENIDA */}

        <section className="welcome-section">

          <div>

            <span className="welcome-label">
              PANEL PRINCIPAL
            </span>

            <h2>
              Hola, {nombre.split(" ")[0]} 
            </h2>

            <p>
              Gestiona tus solicitudes de soporte
              de manera rápida y sencilla.
            </p>

          </div>

        </section>


        {/*
            ACCIONES
         */}

        <section className="actions-section">

          <h3>
            ¿Qué deseas hacer?
          </h3>

          <div className="action-grid">


            {/* MIS SOLICITUDES */}

            <button
              className="action-card"
              onClick={() =>
                navigate("/solicitudes")
              }
            >

              <div className="action-icon blue">
                
              </div>

              <div className="action-text">

                <h4>
                  Mis solicitudes
                </h4>

                <p>
                  Consulta el estado de tus
                  solicitudes de soporte.
                </p>

              </div>

              <span className="action-arrow">
                →
              </span>

            </button>


            {/* NUEVA SOLICITUD */}

            <button
              className="action-card"
              onClick={() =>
                navigate("/nueva-solicitud")
              }
            >

              <div className="action-icon green">
                
              </div>

              <div className="action-text">

                <h4>
                  Nueva solicitud
                </h4>

                <p>
                  Registra una nueva solicitud
                  de soporte.
                </p>

              </div>

              <span className="action-arrow">
                →
              </span>

            </button>


            {/* CATÁLOGO */}

            <button
              className="action-card"
              onClick={() =>
                navigate("/catalogo")
              }
            >

              <div className="action-icon purple">
                
              </div>

              <div className="action-text">

                <h4>
                  Catálogo
                </h4>

                <p>
                  Consulta las categorías
                  disponibles.
                </p>

              </div>

              <span className="action-arrow">
                →
              </span>

            </button>

          </div>

        </section>


        {/* 
            CATEGORÍAS
         */}

        <section className="categories-section">

          <div className="section-title">

            <div>

              <h3>
                Categorías disponibles
              </h3>

              <p>
                Tipos de soporte disponibles
                en MesaTech Cloud.
              </p>

            </div>

            <button
              className="view-catalog-button"
              onClick={() =>
                navigate("/catalogo")
              }
            >
              Ver catálogo
            </button>

          </div>


          <div className="category-grid">

            <div className="category-card">

              <div className="category-icon">
                
              </div>

              <div>
                <h4>
                  Hardware
                </h4>

                <p>
                  Equipos y componentes
                </p>
              </div>

            </div>


            <div className="category-card">

              <div className="category-icon">
                
              </div>

              <div>
                <h4>
                  Software
                </h4>

                <p>
                  Aplicaciones y sistemas
                </p>
              </div>

            </div>


            <div className="category-card">

              <div className="category-icon">
                
              </div>

              <div>
                <h4>
                  Redes
                </h4>

                <p>
                  Conectividad y comunicaciones
                </p>
              </div>

            </div>


            <div className="category-card">

              <div className="category-icon">
                
              </div>

              <div>
                <h4>
                  Accesos
                </h4>

                <p>
                  Usuarios y permisos
                </p>
              </div>

            </div>

          </div>

        </section>

      </main>


      {/* 
          FOOTER
       */}

     <footer className="developer-signature">

          Desarrollado por Alexis Poblete, Damian Villanueva y Francisco Vásquez | Sistema creado para la asignatura de Desarrollo Cloud Native 2026

        </footer>

    </div>
  );
}

export default Home;