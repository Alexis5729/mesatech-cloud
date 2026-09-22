import { useEffect, useState } from "react";
import { useMsal } from "@azure/msal-react";
import { useNavigate } from "react-router-dom";
import { apiGet } from "../services/api";
import "./Solicitudes.css";

function Solicitudes() {
  const { accounts } = useMsal();
  const navigate = useNavigate();

  const account = accounts[0];

  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargarSolicitudes = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await apiGet(
          "/v1/solicitudes/mias"
        );

        setSolicitudes(
          Array.isArray(data)
            ? data
            : data.content || []
        );

      } catch (error) {
        console.error(
          "Error cargando solicitudes:",
          error
        );

        setError(
          "No fue posible cargar tus solicitudes."
        );

      } finally {
        setLoading(false);
      }
    };

    cargarSolicitudes();
  }, []);

  return (
    <div className="solicitudes-page">

      <header className="page-header">
        <button
  type="button"
  className="back-button"
  onClick={() => navigate(-1)}
>
  <span className="back-icon">←</span>
  <span>Volver</span>
</button>

        <div className="page-brand">
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

      <main className="solicitudes-content">

    

        <section className="page-title">

          <span>
            SOLICITUDES
          </span>

          <h2>
            Mis solicitudes
          </h2>

          <p>
            Consulta y realiza seguimiento
            de tus solicitudes de soporte.
          </p>

        </section>

        <section className="solicitudes-card">

          {loading && (
            <div className="state-message">
              <div className="loading-spinner"></div>
              <p>
                Cargando solicitudes...
              </p>
            </div>
          )}

          {!loading && error && (
            <div className="state-message error-state">
              <div className="state-icon">
                
              </div>

              <h3>
                No fue posible cargar las solicitudes
              </h3>

              <p>
                {error}
              </p>
            </div>
          )}

          {!loading &&
            !error &&
            solicitudes.length === 0 && (

            <div className="state-message">

              <div className="state-icon">
                📋
              </div>

              <h3>
                No tienes solicitudes
              </h3>

              <p>
                Cuando registres una solicitud,
                aparecerá aquí.
              </p>

              <button
                className="primary-button"
                onClick={() =>
                  navigate("/nueva-solicitud")
                }
              >
                Crear solicitud
              </button>

            </div>
          )}

          {!loading &&
            !error &&
            solicitudes.length > 0 && (

            <div className="table-container">

              <table>

                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Solicitud</th>
                    <th>Estado</th>
                    <th>Prioridad</th>
                    <th>Fecha</th>
                  </tr>
                </thead>

                <tbody>

                  {solicitudes.map((solicitud) => (

                    <tr key={solicitud.id}>

                      <td>
                        #{solicitud.id}
                      </td>

                      <td>
                        <strong>
                          {solicitud.titulo ||
                            solicitud.title ||
                            "Sin título"}
                        </strong>
                      </td>

                      <td>
                        <span
                          className={`status-badge status-${String(
                            solicitud.estado ||
                              solicitud.status ||
                              "CREADA"
                          ).toLowerCase()}`}
                        >
                          {solicitud.estado ||
                            solicitud.status ||
                            "CREADA"}
                        </span>
                      </td>

                      <td>
                        {solicitud.prioridad ||
                          solicitud.priority ||
                          "—"}
                      </td>

                      <td>
                        {solicitud.fechaCreacion ||
                          solicitud.createdAt ||
                          "—"}
                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>
          )}

        </section>

      </main>
       <footer className="developer-signature">

          Desarrollado por Alexis Poblete, Damian Villanueva y Francisco Vásquez | Sistema creado para la asignatura de Desarrollo Cloud Native 2026

        </footer>

    </div>
  );
}

export default Solicitudes;