import { useEffect, useState } from "react";
import { useMsal } from "@azure/msal-react";
import { useNavigate } from "react-router-dom";
import {apiGet,apiPatch,} from "../services/api";
import { useUserRoles } from "../hooks/useUserRoles";
import "./Solicitudes.css";

function Solicitudes() {
  const { accounts } = useMsal();
  const navigate = useNavigate();

  const account = accounts[0];

const {
  esCliente,
  esOperador,
  esAdministrador,
  loadingRoles,
} = useUserRoles();

  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [actualizandoId, setActualizandoId] = useState(null);
const [estadoSeleccionado, setEstadoSeleccionado] = useState({});

  const prioridades = {
    1: "Baja",
    2: "Media",
    3: "Alta",
    4: "Crítica",
  };
  const estados = [
  "CREADA",
  "ASIGNADA",
  "EN_PROCESO",
  "RESUELTA",
  "CERRADA",
  "CANCELADA",
];

  useEffect(() => {
    const cargarSolicitudes = async () => {
      try {
        setLoading(true);
        setError("");

        const endpoint = esCliente
          ? "/v1/solicitudes/mias"
          : "/v1/solicitudes";

        const data = await apiGet(endpoint);

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

    if (loadingRoles) {
      return;
    }

    cargarSolicitudes();

  }, [esCliente, loadingRoles]);
  const cambiarEstado = async (id) => {
  const nuevoEstado = estadoSeleccionado[id];

  if (!nuevoEstado) {
    return;
  }

  try {
    setActualizandoId(id);
    setError("");

    await apiPatch(
      `/v1/solicitudes/${id}/estado`,
      {
        estado: nuevoEstado,
      }
    );

    const endpoint = esCliente
      ? "/v1/solicitudes/mias"
      : "/v1/solicitudes";

    const data = await apiGet(endpoint);

    setSolicitudes(
      Array.isArray(data)
        ? data
        : data.content || []
    );

    setEstadoSeleccionado((prev) => ({
      ...prev,
      [id]: "",
    }));

  } catch (error) {
    console.error(
      "Error actualizando estado:",
      error
    );

    setError(
      error.message ||
      "No fue posible actualizar el estado."
    );

  } finally {
    setActualizandoId(null);
  }
};

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
            {esCliente
              ? "Mis solicitudes"
              : "Gestionar solicitudes"}
          </h2>

          <p>
            {esCliente
              ? "Consulta y realiza seguimiento de tus solicitudes de soporte."
              : "Consulta y gestiona las solicitudes de soporte registradas."}
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

    {(esOperador || esAdministrador) && (
      <th>Acciones</th>
    )}
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
                        {prioridades[solicitud.prioridadId] || "—"}
                      </td>

                      <td>
                        {solicitud.fechaCreacion
                          ? new Date(solicitud.fechaCreacion).toLocaleString("es-CL")
                          : "—"}
                      </td>
                      {(esOperador || esAdministrador) && (
  <td className="actions-cell">

    <select
      value={estadoSeleccionado[solicitud.id] || ""}
      onChange={(e) =>
        setEstadoSeleccionado((prev) => ({
          ...prev,
          [solicitud.id]: e.target.value,
        }))
      }
      disabled={actualizandoId === solicitud.id}
    >
      <option value="">
        Seleccionar estado
      </option>

      {estados.map((estado) => (
        <option
          key={estado}
          value={estado}
        >
          {estado}
        </option>
      ))}
    </select>

    <button
      type="button"
      className="update-status-button"
      onClick={() =>
        cambiarEstado(solicitud.id)
      }
      disabled={
        !estadoSeleccionado[solicitud.id] ||
        actualizandoId === solicitud.id
      }
    >
      {actualizandoId === solicitud.id
        ? "Actualizando..."
        : "Actualizar"}
    </button>

  </td>
)}

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
