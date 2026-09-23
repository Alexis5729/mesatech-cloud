import { useEffect, useState } from "react";
import { useMsal } from "@azure/msal-react";
import { useNavigate } from "react-router-dom";
import { apiGet } from "../services/api";
import "./Catalogo.css";

function Catalogo() {
  const { accounts } = useMsal();
  const navigate = useNavigate();

  const account = accounts[0];

  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargarCatalogo = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await apiGet("/v1/catalogo/categorias");

        console.log("Respuesta catálogo:", data);

        setCategorias(
          Array.isArray(data)
            ? data
            : data.content || data.items || []
        );

      } catch (error) {
        console.error(
          "Error cargando catálogo:",
          error
        );

        setError(
          "No fue posible cargar las categorías."
        );

      } finally {
        setLoading(false);
      }
    };

    cargarCatalogo();
  }, []);

  return (
    <div className="catalogo-page">

      {/* HEADER */}

      <header className="page-header">

        <div className="page-brand">
          <button
  type="button"
  className="back-button"
  onClick={() => navigate(-1)}
>
  <span className="back-icon">←</span>
  <span>Volver</span>
</button>
          
          <div className="page-brand-icon">
            M
          </div>
          

          <div>
            <h1>MesaTech Cloud</h1>
            <span>Gestión de soporte</span>
          </div>

        </div>

        <div className="page-user">

          <span>
            {account?.name}
          </span>

          <div className="page-avatar">
            {account?.name
              ?.charAt(0)
              .toUpperCase()}
          </div>

        </div>

      </header>


      {/* CONTENIDO */}

      <main className="catalogo-content">

       


        <section className="page-title">

          <span>
            CATÁLOGO
          </span>

          <h2>
            Categorías de soporte
          </h2>

          <p>
            Consulta las categorías disponibles
            para tus solicitudes.
          </p>

        </section>


        {/* CONTENIDO DEL CATÁLOGO */}

        {loading && (

          <section className="catalogo-state">

            <div className="loading-spinner"></div>

            <p>
              Cargando categorías...
            </p>

          </section>

        )}


        {!loading && error && (

          <section className="catalogo-state error-state">

            <div className="state-icon">
              
            </div>

            <h3>
              No fue posible cargar el catálogo
            </h3>

            <p>
              {error}
            </p>

            <button
              className="primary-button"
              onClick={() =>
                window.location.reload()
              }
            >
              Reintentar
            </button>

          </section>

        )}


        {!loading &&
          !error &&
          categorias.length === 0 && (

          <section className="catalogo-state">

            <div className="state-icon">
              
            </div>

            <h3>
              No hay categorías disponibles
            </h3>

            <p>
              Actualmente no existen categorías
              registradas en el catálogo.
            </p>

          </section>

        )}


        {!loading &&
          !error &&
          categorias.length > 0 && (

          <section className="category-grid">

            {categorias.map((categoria) => (

              <article
                className="category-card"
                key={
                  categoria.id ||
                  categoria.codigo ||
                  categoria.nombre
                }
              >

                <div className="category-icon">
                  
                </div>

                <div className="category-content">

                  <h3>
                    {categoria.nombre ||
                      categoria.name ||
                      categoria.descripcion ||
                      "Categoría"}
                  </h3>

                  <p>
                    {categoria.descripcion ||
                      categoria.description ||
                      "Categoría disponible para solicitudes de soporte."}
                  </p>

                </div>

              </article>

            ))}

          </section>

        )}

      </main>
       <footer className="developer-signature">

          Desarrollado por Alexis Poblete, Damian Villanueva y Francisco Vásquez | Sistema creado para la asignatura de Desarrollo Cloud Native 2026

        </footer>

    </div>
  );
}

export default Catalogo;