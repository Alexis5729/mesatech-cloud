import { useEffect, useState } from "react";
import { useMsal } from "@azure/msal-react";
import { useNavigate } from "react-router-dom";
import {
  apiGet,
  apiPost,
  apiPut,
  apiDelete,
} from "../services/api";
import { useUserRoles } from "../hooks/useUserRoles";
import "./Catalogo.css";

function Catalogo() {
  const { accounts } = useMsal();
  const navigate = useNavigate();

  const account = accounts[0];

  const {
    esAdministrador,
    loadingRoles,
  } = useUserRoles();

  // =========================
  // CATEGORÍAS
  // =========================

  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);

  // =========================
  // PRIORIDADES
  // =========================

  const [prioridades, setPrioridades] = useState([]);
  const [loadingPrioridades, setLoadingPrioridades] = useState(true);

  // =========================
  // ADMINISTRACIÓN
  // =========================

  const [modoAdministracion, setModoAdministracion] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const [error, setError] = useState("");

  // =========================
  // FORMULARIO CATEGORÍA
  // =========================

  const [nuevaCategoria, setNuevaCategoria] = useState({
    nombre: "",
    descripcion: "",
  });

  const [categoriaEditando, setCategoriaEditando] = useState(null);

  // =========================
  // FORMULARIO PRIORIDAD
  // =========================

  const [nuevaPrioridad, setNuevaPrioridad] = useState({
    nombre: "",
    nivel: "",
  });

  const [prioridadEditando, setPrioridadEditando] = useState(null);

  // =========================
  // ESTADOS DE OPERACIONES
  // =========================

  const [eliminandoId, setEliminandoId] = useState(null);

  // =========================
  // CARGAR CATEGORÍAS
  // =========================

  useEffect(() => {
    const cargarCatalogo = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await apiGet(
          "/v1/catalogo/categorias"
        );

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

  // =========================
  // CARGAR PRIORIDADES
  // =========================

  useEffect(() => {
    const cargarPrioridades = async () => {
      try {
        setLoadingPrioridades(true);

        const data = await apiGet(
          "/v1/catalogo/prioridades"
        );

        setPrioridades(
          Array.isArray(data)
            ? data
            : data.content || data.items || []
        );
      } catch (error) {
        console.error(
          "Error cargando prioridades:",
          error
        );

        setError(
          "No fue posible cargar las prioridades."
        );
      } finally {
        setLoadingPrioridades(false);
      }
    };

    cargarPrioridades();
  }, []);

  // =========================
  // CREAR CATEGORÍA
  // =========================

  const crearCategoria = async () => {
    if (!nuevaCategoria.nombre.trim()) {
      setError(
        "El nombre de la categoría es obligatorio."
      );
      return;
    }

    try {
      setError("");

      await apiPost(
        "/v1/catalogo/categorias",
        {
          nombre: nuevaCategoria.nombre.trim(),
          descripcion:
            nuevaCategoria.descripcion.trim(),
        }
      );

      const data = await apiGet(
        "/v1/catalogo/categorias"
      );

      setCategorias(
        Array.isArray(data)
          ? data
          : data.content || data.items || []
      );

      setNuevaCategoria({
        nombre: "",
        descripcion: "",
      });

      setMostrarFormulario(false);
    } catch (error) {
      console.error(
        "Error creando categoría:",
        error
      );

      setError(
        error.message ||
          "No fue posible crear la categoría."
      );
    }
  };

  // =========================
  // ACTUALIZAR CATEGORÍA
  // =========================

  const actualizarCategoria = async () => {
    if (!categoriaEditando) {
      return;
    }

    if (!nuevaCategoria.nombre.trim()) {
      setError(
        "El nombre de la categoría es obligatorio."
      );
      return;
    }

    try {
      setError("");

      await apiPut(
        `/v1/catalogo/categorias/${categoriaEditando.id}`,
        {
          nombre: nuevaCategoria.nombre.trim(),
          descripcion:
            nuevaCategoria.descripcion.trim(),
        }
      );

      const data = await apiGet(
        "/v1/catalogo/categorias"
      );

      setCategorias(
        Array.isArray(data)
          ? data
          : data.content || data.items || []
      );

      setNuevaCategoria({
        nombre: "",
        descripcion: "",
      });

      setCategoriaEditando(null);
      setMostrarFormulario(false);
    } catch (error) {
      console.error(
        "Error actualizando categoría:",
        error
      );

      setError(
        error.message ||
          "No fue posible actualizar la categoría."
      );
    }
  };

  // =========================
  // ELIMINAR CATEGORÍA
  // =========================

  const eliminarCategoria = async (id) => {
    const confirmar = window.confirm(
      "¿Estás seguro de que deseas eliminar esta categoría?"
    );

    if (!confirmar) {
      return;
    }

    try {
      setError("");
      setEliminandoId(id);

      await apiDelete(
        `/v1/catalogo/categorias/${id}`
      );

      const data = await apiGet(
        "/v1/catalogo/categorias"
      );

      setCategorias(
        Array.isArray(data)
          ? data
          : data.content || data.items || []
      );
    } catch (error) {
      console.error(
        "Error eliminando categoría:",
        error
      );

      setError(
        error.message ||
          "No fue posible eliminar la categoría."
      );
    } finally {
      setEliminandoId(null);
    }
  };

  // =========================
  // CREAR PRIORIDAD
  // =========================

  const crearPrioridad = async () => {
    if (!nuevaPrioridad.nombre.trim()) {
      setError(
        "El nombre de la prioridad es obligatorio."
      );
      return;
    }

    const nivel = Number(nuevaPrioridad.nivel);

    if (!Number.isInteger(nivel) || nivel <= 0) {
      setError(
        "El nivel de la prioridad debe ser un número entero positivo."
      );
      return;
    }

    try {
      setError("");

      await apiPost(
        "/v1/catalogo/prioridades",
        {
          nombre: nuevaPrioridad.nombre.trim(),
          nivel,
        }
      );

      const data = await apiGet(
        "/v1/catalogo/prioridades"
      );

      setPrioridades(
        Array.isArray(data)
          ? data
          : data.content || data.items || []
      );

      setNuevaPrioridad({
        nombre: "",
        nivel: "",
      });
    } catch (error) {
      console.error(
        "Error creando prioridad:",
        error
      );

      setError(
        error.message ||
          "No fue posible crear la prioridad."
      );
    }
  };

  // =========================
  // ACTUALIZAR PRIORIDAD
  // =========================

  const actualizarPrioridad = async () => {
    if (!prioridadEditando) {
      return;
    }

    if (!nuevaPrioridad.nombre.trim()) {
      setError(
        "El nombre de la prioridad es obligatorio."
      );
      return;
    }

    const nivel = Number(nuevaPrioridad.nivel);

    if (!Number.isInteger(nivel) || nivel <= 0) {
      setError(
        "El nivel de la prioridad debe ser un número entero positivo."
      );
      return;
    }

    try {
      setError("");

      await apiPut(
        `/v1/catalogo/prioridades/${prioridadEditando.id}`,
        {
          nombre: nuevaPrioridad.nombre.trim(),
          nivel,
        }
      );

      const data = await apiGet(
        "/v1/catalogo/prioridades"
      );

      setPrioridades(
        Array.isArray(data)
          ? data
          : data.content || data.items || []
      );

      setNuevaPrioridad({
        nombre: "",
        nivel: "",
      });

      setPrioridadEditando(null);
    } catch (error) {
      console.error(
        "Error actualizando prioridad:",
        error
      );

      setError(
        error.message ||
          "No fue posible actualizar la prioridad."
      );
    }
  };

  // =========================
  // ELIMINAR PRIORIDAD
  // =========================

  const eliminarPrioridad = async (id) => {
    const confirmar = window.confirm(
      "¿Estás seguro de que deseas eliminar esta prioridad?"
    );

    if (!confirmar) {
      return;
    }

    try {
      setError("");
      setEliminandoId(id);

      await apiDelete(
        `/v1/catalogo/prioridades/${id}`
      );

      const data = await apiGet(
        "/v1/catalogo/prioridades"
      );

      setPrioridades(
        Array.isArray(data)
          ? data
          : data.content || data.items || []
      );

      if (prioridadEditando?.id === id) {
        setPrioridadEditando(null);
        setNuevaPrioridad({
          nombre: "",
          nivel: "",
        });
      }
    } catch (error) {
      console.error(
        "Error eliminando prioridad:",
        error
      );

      setError(
        error.message ||
          "No fue posible eliminar la prioridad."
      );
    } finally {
      setEliminandoId(null);
    }
  };

  // =========================
  // RENDER
  // =========================

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
            <span className="back-icon">
              ←
            </span>

            <span>
              Volver
            </span>
          </button>

          <div className="page-brand-icon">
            M
          </div>

          <div>
            <h1>
              MesaTech Cloud
            </h1>

            <span>
              Gestión de soporte
            </span>
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

        {/* TÍTULO */}

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

          {!loadingRoles &&
            esAdministrador && (
              <button
                type="button"
                className="admin-catalog-button"
                onClick={() =>
                  setModoAdministracion(
                    (prev) => !prev
                  )
                }
              >
                {modoAdministracion
                  ? "Cerrar administración"
                  : "Administrar catálogo"}
              </button>
            )}

        </section>

        {/* CARGANDO CATEGORÍAS */}

        {loading && (
          <section className="catalogo-state">

            <div className="loading-spinner"></div>

            <p>
              Cargando categorías...
            </p>

          </section>
        )}

        {/* ERROR */}

        {!loading && error && (
          <section className="catalogo-state error-state">

            <div className="state-icon"></div>

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

        {/* =========================
            FORMULARIO CATEGORÍA
        ========================= */}

        {modoAdministracion &&
          mostrarFormulario && (
            <section className="admin-category-form">

              <div className="admin-form-header">

                <div>
                  <span>
                    ADMINISTRACIÓN
                  </span>

                  <h3>
                    {categoriaEditando
                      ? "Editar categoría"
                      : "Nueva categoría"}
                  </h3>
                </div>

                <button
                  type="button"
                  className="close-form-button"
                  onClick={() => {
                    setMostrarFormulario(false);
                    setCategoriaEditando(null);
                  }}
                >
                  ×
                </button>

              </div>

              <div className="form-group">

                <label htmlFor="nombreCategoria">
                  Nombre de la categoría
                </label>

                <input
                  id="nombreCategoria"
                  type="text"
                  value={nuevaCategoria.nombre}
                  onChange={(e) =>
                    setNuevaCategoria(
                      (prev) => ({
                        ...prev,
                        nombre:
                          e.target.value,
                      })
                    )
                  }
                  placeholder="Ej: Soporte de hardware"
                />

              </div>

              <div className="form-group">

                <label htmlFor="descripcionCategoria">
                  Descripción
                </label>

                <textarea
                  id="descripcionCategoria"
                  value={
                    nuevaCategoria.descripcion
                  }
                  onChange={(e) =>
                    setNuevaCategoria(
                      (prev) => ({
                        ...prev,
                        descripcion:
                          e.target.value,
                      })
                    )
                  }
                  placeholder="Describe esta categoría..."
                  rows="4"
                />

              </div>

              <button
                type="button"
                className="primary-button"
                onClick={
                  categoriaEditando
                    ? actualizarCategoria
                    : crearCategoria
                }
              >
                {categoriaEditando
                  ? "Guardar cambios"
                  : "Crear categoría"}
              </button>

            </section>
          )}

        {/* =========================
            ADMINISTRACIÓN PRIORIDADES
        ========================= */}

        {modoAdministracion &&
          esAdministrador && (
            <section className="admin-prioridades">

              <div className="admin-form-header">

                <div>
                  <span>
                    ADMINISTRACIÓN
                  </span>

                  <h3>
                    Prioridades
                  </h3>
                </div>

                <button
                  type="button"
                  className="primary-button"
                  onClick={() => {
                    setPrioridadEditando(null);

                    setNuevaPrioridad({
                      nombre: "",
                      nivel: "",
                    });
                  }}
                >
                  Nueva prioridad
                </button>

              </div>

              {/* FORMULARIO PARA CREAR O EDITAR UNA PRIORIDAD */}

              {modoAdministracion && (
                  <div className="priority-form">

                    <div className="form-group">

                      <label htmlFor="nombrePrioridad">
                        Nombre de la prioridad
                      </label>

                      <input
                        id="nombrePrioridad"
                        type="text"
                        value={
                          nuevaPrioridad.nombre
                        }
                        onChange={(e) =>
                          setNuevaPrioridad(
                            (prev) => ({
                              ...prev,
                              nombre:
                                e.target.value,
                            })
                          )
                        }
                        placeholder="Ej: Alta"
                      />

                    </div>

                    <div className="form-group">

                      <label htmlFor="nivelPrioridad">
                        Nivel
                      </label>

                      <input
                        id="nivelPrioridad"
                        type="number"
                        min="1"
                        step="1"
                        value={
                          nuevaPrioridad.nivel
                        }
                        onChange={(e) =>
                          setNuevaPrioridad(
                            (prev) => ({
                              ...prev,
                              nivel:
                                e.target.value,
                            })
                          )
                        }
                        placeholder="Ej: 1"
                      />

                    </div>

                    <button
                      type="button"
                      className="primary-button"
                      onClick={
                        prioridadEditando
                          ? actualizarPrioridad
                          : crearPrioridad
                      }
                    >
                      {prioridadEditando
                        ? "Guardar cambios"
                        : "Crear prioridad"}
                    </button>

                  </div>
                )}

              {/* LISTA DE PRIORIDADES */}

              {loadingPrioridades ? (
                <p>
                  Cargando prioridades...
                </p>
              ) : prioridades.length === 0 ? (
                <p>
                  No hay prioridades registradas.
                </p>
              ) : (
                <div className="priority-list">

                  {prioridades.map(
                    (prioridad) => (
                      <article
                        className="priority-item"
                        key={prioridad.id}
                      >

                        <div>

                          <h4>
                            {prioridad.nombre ||
                              prioridad.name ||
                              "Prioridad"}
                          </h4>

                          <p>
                            Nivel: {prioridad.nivel}
                          </p>

                        </div>

                        <div className="priority-actions">

                          <button
                            type="button"
                            className="edit-category-button"
                            onClick={() => {
                              setPrioridadEditando(
                                prioridad
                              );

                              setNuevaPrioridad({
                                nombre:
                                  prioridad.nombre ||
                                  prioridad.name ||
                                  "",
                                nivel:
                                  prioridad.nivel ||
                                  "",
                              });
                            }}
                          >
                            Editar
                          </button>

                          <button
                            type="button"
                            className="delete-category-button"
                            onClick={() =>
                              eliminarPrioridad(
                                prioridad.id
                              )
                            }
                            disabled={
                              eliminandoId === prioridad.id
                            }
                          >
                            {eliminandoId === prioridad.id
                              ? "Eliminando..."
                              : "Eliminar"}
                          </button>

                        </div>

                      </article>
                    )
                  )}

                </div>
              )}

            </section>
          )}

        {/* =========================
            SIN CATEGORÍAS
        ========================= */}

        {!loading &&
          !error &&
          categorias.length === 0 && (
            <section className="catalogo-state">

              <div className="state-icon"></div>

              <h3>
                No hay categorías disponibles
              </h3>

              <p>
                Actualmente no existen categorías
                registradas en el catálogo.
              </p>

            </section>
          )}

        {/* =========================
            CATEGORÍAS
        ========================= */}

        {!loading &&
          !error &&
          categorias.length > 0 && (
            <section className="category-grid">

              {categorias.map(
                (categoria) => (
                  <article
                    className="category-card"
                    key={
                      categoria.id ||
                      categoria.codigo ||
                      categoria.nombre
                    }
                  >

                    <div className="category-icon"></div>

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

                    {modoAdministracion &&
                      esAdministrador && (
                        <div className="category-actions">

                          <button
                            type="button"
                            className="edit-category-button"
                            onClick={() => {
                              setCategoriaEditando(
                                categoria
                              );

                              setNuevaCategoria({
                                nombre:
                                  categoria.nombre ||
                                  categoria.name ||
                                  "",
                                descripcion:
                                  categoria.descripcion ||
                                  categoria.description ||
                                  "",
                              });

                              setMostrarFormulario(
                                true
                              );
                            }}
                          >
                            Editar
                          </button>

                          <button
                            type="button"
                            className="delete-category-button"
                            onClick={() =>
                              eliminarCategoria(
                                categoria.id
                              )
                            }
                            disabled={
                              eliminandoId ===
                              categoria.id
                            }
                          >
                            {eliminandoId ===
                            categoria.id
                              ? "Eliminando..."
                              : "Eliminar"}
                          </button>

                        </div>
                      )}

                  </article>
                )
              )}

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
