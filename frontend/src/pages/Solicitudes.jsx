import { useEffect, useState } from "react";
import { useMsal } from "@azure/msal-react";
import { useNavigate } from "react-router-dom";

import {
  ClipboardList,
  RefreshCw,
  AlertCircle,
  PlusCircle,
  UserRound,
} from "lucide-react";

import { apiGet, apiPatch } from "../services/api";
import { useUserRoles } from "../hooks/useUserRoles";

import PageHeader from "../components/PageHeader";

import "./Solicitudes.css";

function Solicitudes() {
  const {
    instance,
    accounts,
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
    loadingRoles,
  } = useUserRoles(account);

  /* =====================================================
     TEMA
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

    return "dark";
  });

  useEffect(() => {
    localStorage.setItem(
      "mesatech-theme",
      theme
    );
  }, [theme]);

  /* =====================================================
     ESTADOS
  ===================================================== */

  const [
    solicitudes,
    setSolicitudes,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    actualizandoId,
    setActualizandoId,
  ] = useState(null);

  const [
    estadoSeleccionado,
    setEstadoSeleccionado,
  ] = useState({});

  /* =====================================================
     DATOS AUXILIARES
  ===================================================== */

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

  /* =====================================================
     CARGAR SOLICITUDES
  ===================================================== */

  const cargarSolicitudes =
    async () => {
      try {
        setLoading(true);
        setError("");

        const endpoint =
          esCliente
            ? "/v1/solicitudes/mias"
            : "/v1/solicitudes";

        const data =
          await apiGet(endpoint);

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

  useEffect(() => {
    if (loadingRoles) {
      return;
    }

    cargarSolicitudes();
  }, [
    esCliente,
    loadingRoles,
    account?.homeAccountId,
  ]);

  /* =====================================================
     CAMBIAR ESTADO
  ===================================================== */

  const cambiarEstado =
    async (id) => {
      const nuevoEstado =
        estadoSeleccionado[id];

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

        await cargarSolicitudes();

        setEstadoSeleccionado(
          (prev) => ({
            ...prev,
            [id]: "",
          })
        );
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

  /* =====================================================
     INTERFAZ
  ===================================================== */

  return (
    <div
      className="solicitudes-page"
      data-theme={theme}
    >

      <PageHeader
        account={account}
        setAccount={setAccount}
        theme={theme}
        setTheme={setTheme}
        onBack={() =>
          navigate(-1)
        }
      />

      <main className="solicitudes-content">

        {/* =================================================
            HERO
        ================================================= */}

        <section className="solicitudes-hero">

          <div className="solicitudes-hero-copy">

            <span className="solicitudes-eyebrow">
              CENTRO DE SOLICITUDES
            </span>

            <h2>
              {esCliente
                ? "Mis solicitudes"
                : "Gestionar solicitudes"}
            </h2>

            <p>
              {esCliente
                ? "Consulta el estado y seguimiento de tus solicitudes de soporte."
                : "Administra las solicitudes registradas y actualiza su estado."}
            </p>

          </div>

          <div className="solicitudes-hero-icon">
            <ClipboardList size={36} />
          </div>

        </section>

        {/* =================================================
            TOOLBAR
        ================================================= */}

        <section className="solicitudes-toolbar">

          <div className="solicitudes-summary">

            <span>
              Solicitudes registradas
            </span>

            <strong>
              {loading
                ? "—"
                : solicitudes.length}
            </strong>

          </div>

          <div className="solicitudes-toolbar-actions">

            <button
              type="button"
              className="solicitudes-refresh-button"
              onClick={
                cargarSolicitudes
              }
              disabled={loading}
            >

              <RefreshCw
                size={17}
                className={
                  loading
                    ? "rotating"
                    : ""
                }
              />

              <span>
                Actualizar
              </span>

            </button>

            <button
              type="button"
              className="solicitudes-new-button"
              onClick={() =>
                navigate(
                  "/nueva-solicitud"
                )
              }
            >

              <PlusCircle size={18} />

              <span>
                Nueva solicitud
              </span>

            </button>

          </div>

        </section>

        {/* =================================================
            CONTENIDO
        ================================================= */}

        <section className="solicitudes-card">

          {/* CARGANDO */}

          {loading && (

            <div className="solicitudes-state-message">

              <div className="solicitudes-loading-spinner" />

              <h3>
                Cargando solicitudes
              </h3>

              <p>
                Estamos consultando la información disponible.
              </p>

            </div>

          )}

          {/* ERROR */}

          {!loading && error && (

            <div className="solicitudes-state-message solicitudes-error-state">

              <div className="solicitudes-state-icon error">

                <AlertCircle size={28} />

              </div>

              <h3>
                No fue posible cargar las solicitudes
              </h3>

              <p>
                {error}
              </p>

              <button
                type="button"
                className="solicitudes-retry-button"
                onClick={
                  cargarSolicitudes
                }
              >
                Reintentar
              </button>

            </div>

          )}

          {/* SIN SOLICITUDES */}

          {!loading &&
            !error &&
            solicitudes.length === 0 && (

              <div className="solicitudes-state-message">

                <div className="solicitudes-state-icon">

                  <ClipboardList size={30} />

                </div>

                <h3>
                  No hay solicitudes registradas
                </h3>

                <p>
                  Cuando se registre una solicitud, aparecerá en este panel.
                </p>

                <button
                  type="button"
                  className="solicitudes-new-button empty"
                  onClick={() =>
                    navigate(
                      "/nueva-solicitud"
                    )
                  }
                >

                  <PlusCircle size={18} />

                  Crear solicitud

                </button>

              </div>

            )}

          {/* TABLA */}

          {!loading &&
            !error &&
            solicitudes.length > 0 && (

              <div className="solicitudes-table-container">

                <table className="solicitudes-table">

                  <thead>

                    <tr>

                      <th>
                        ID
                      </th>

                      <th>
                        Solicitud
                      </th>

                      <th>
                        Estado
                      </th>

                      <th>
                        Prioridad
                      </th>

                      <th>
                        Fecha
                      </th>

                      {(esOperador ||
                        esAdministrador) && (

                        <th>
                          Acciones
                        </th>

                      )}

                    </tr>

                  </thead>

                  <tbody>

                    {solicitudes.map(
                      (solicitud) => {

                        const estado =
                          solicitud.estado ||
                          solicitud.status ||
                          "CREADA";

                        return (

                          <tr
                            key={
                              solicitud.id
                            }
                          >

                            <td>

                              <span className="solicitud-id">

                                #{solicitud.id}

                              </span>

                            </td>

                            <td>

                              <div className="solicitud-name-cell">

                                <div className="solicitud-mini-icon">

                                  <UserRound size={16} />

                                </div>

                                <strong>

                                  {solicitud.titulo ||
                                    solicitud.title ||
                                    "Sin título"}

                                </strong>

                              </div>

                            </td>

                            <td>

                              <span
                                className={
                                  `status-badge status-${String(
                                    estado
                                  ).toLowerCase()}`
                                }
                              >

                                {estado.replace(
                                  "_",
                                  " "
                                )}

                              </span>

                            </td>

                            <td>

                              <span className="priority-label">

                                {prioridades[
                                  solicitud.prioridadId
                                ] || "—"}

                              </span>

                            </td>

                            <td>

                              {solicitud.fechaCreacion
                                ? new Date(
                                    solicitud.fechaCreacion
                                  ).toLocaleString(
                                    "es-CL"
                                  )
                                : "—"}

                            </td>

                            {(esOperador ||
                              esAdministrador) && (

                              <td className="actions-cell">

                                <select
                                  value={
                                    estadoSeleccionado[
                                      solicitud.id
                                    ] || ""
                                  }
                                  onChange={(e) =>
                                    setEstadoSeleccionado(
                                      (prev) => ({
                                        ...prev,
                                        [solicitud.id]:
                                          e.target.value,
                                      })
                                    )
                                  }
                                  disabled={
                                    actualizandoId ===
                                    solicitud.id
                                  }
                                >

                                  <option value="">
                                    Seleccionar estado
                                  </option>

                                  {estados.map(
                                    (
                                      estadoOption
                                    ) => (

                                      <option
                                        key={
                                          estadoOption
                                        }
                                        value={
                                          estadoOption
                                        }
                                      >

                                        {estadoOption.replace(
                                          "_",
                                          " "
                                        )}

                                      </option>

                                    )
                                  )}

                                </select>

                                <button
                                  type="button"
                                  className="update-status-button"
                                  onClick={() =>
                                    cambiarEstado(
                                      solicitud.id
                                    )
                                  }
                                  disabled={
                                    !estadoSeleccionado[
                                      solicitud.id
                                    ] ||
                                    actualizandoId ===
                                      solicitud.id
                                  }
                                >

                                  {actualizandoId ===
                                  solicitud.id
                                    ? "Actualizando..."
                                    : "Actualizar"}

                                </button>

                              </td>

                            )}

                          </tr>

                        );
                      }
                    )}

                  </tbody>

                </table>

              </div>

            )}

        </section>

      </main>

      <footer className="solicitudes-footer">

        Desarrollado por Alexis Poblete y Damian Villanueva
        {" | "}
        Desarrollo Cloud Native 2026

      </footer>

    </div>
  );
}

export default Solicitudes;