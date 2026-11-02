import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMsal } from "@azure/msal-react";

import {
  FilePlus2,
  Send,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

import {
  apiGet,
  apiPost,
} from "../services/api";

import PageHeader from "../components/PageHeader";

import "./NuevaSolicitud.css";

function NuevaSolicitud() {
  const navigate = useNavigate();

  const {
    instance,
    accounts,
  } = useMsal();

  /* =====================================================
     CUENTA ACTIVA
  ===================================================== */

  const [account, setAccount] = useState(() =>
    instance.getActiveAccount() ||
    accounts[0] ||
    null
  );

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
     FORMULARIO
  ===================================================== */

  const [
    formulario,
    setFormulario,
  ] = useState({
    titulo: "",
    descripcion: "",
    categoriaId: "",
    prioridadId: "2",
  });

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");

  /* =====================================================
     CATEGORÍAS
  ===================================================== */

  const [
    categorias,
    setCategorias,
  ] = useState([]);

  const [
    loadingCategorias,
    setLoadingCategorias,
  ] = useState(true);

  /* =====================================================
     PRIORIDADES
  ===================================================== */

  const [
    prioridades,
    setPrioridades,
  ] = useState([]);

  const [
    loadingPrioridades,
    setLoadingPrioridades,
  ] = useState(true);

  /* =====================================================
     CARGAR CATEGORÍAS
  ===================================================== */

  useEffect(() => {
    const cargarCategorias =
      async () => {
        try {
          setLoadingCategorias(true);

          const data =
            await apiGet(
              "/v1/solicitudes/categorias"
            );

          setCategorias(
            Array.isArray(data)
              ? data
              : data.content ||
                data.items ||
                []
          );
        } catch (error) {
          console.error(
            "Error cargando categorías:",
            error
          );

          setError(
            "No fue posible cargar las categorías."
          );
        } finally {
          setLoadingCategorias(false);
        }
      };

    cargarCategorias();
  }, []);

  /* =====================================================
     CARGAR PRIORIDADES
  ===================================================== */

  useEffect(() => {
    const cargarPrioridades =
      async () => {
        try {
          setLoadingPrioridades(true);

          const data =
            await apiGet(
              "/v1/catalogo/prioridades"
            );

          setPrioridades(
            Array.isArray(data)
              ? data
              : data.content ||
                data.items ||
                []
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

  /* =====================================================
     CAMBIOS FORMULARIO
  ===================================================== */

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setFormulario(
      (prev) => ({
        ...prev,
        [name]: value,
      })
    );
  };

  /* =====================================================
     CREAR SOLICITUD
  ===================================================== */

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      setError("");
      setSuccess("");

      if (
        !formulario.titulo.trim()
      ) {
        setError(
          "Debes ingresar un título."
        );

        return;
      }

      if (
        !formulario.descripcion.trim()
      ) {
        setError(
          "Debes ingresar una descripción."
        );

        return;
      }

      if (
        !formulario.categoriaId
      ) {
        setError(
          "Debes seleccionar una categoría."
        );

        return;
      }

      if (
        !formulario.prioridadId
      ) {
        setError(
          "Debes seleccionar una prioridad."
        );

        return;
      }

      try {
        setLoading(true);

        const solicitud =
          await apiPost(
            "/v1/solicitudes",
            formulario
          );

        console.log(
          "Solicitud creada:",
          solicitud
        );

        setSuccess(
          "La solicitud fue creada correctamente."
        );

        setFormulario({
          titulo: "",
          descripcion: "",
          categoriaId: "",
          prioridadId: "2",
        });
      } catch (error) {
        console.error(
          "Error creando solicitud:",
          error
        );

        setError(
          "No fue posible crear la solicitud."
        );
      } finally {
        setLoading(false);
      }
    };

  /* =====================================================
     INTERFAZ
  ===================================================== */

  return (
    <div
      className="nueva-solicitud-page"
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

      <main className="nueva-solicitud-content">

        {/* =================================================
            HERO
        ================================================= */}

        <section className="nueva-solicitud-hero">

          <div className="nueva-solicitud-hero-copy">

            <span className="nueva-solicitud-eyebrow">
              CREAR SOLICITUD
            </span>

            <h2>
              Nueva solicitud
            </h2>

            <p>
              Registra un nuevo requerimiento de soporte y selecciona su categoría y prioridad.
            </p>

          </div>

          <div className="nueva-solicitud-hero-icon">
            <FilePlus2 size={36} />
          </div>

        </section>

        {/* =================================================
            FORMULARIO
        ================================================= */}

        <section className="nueva-solicitud-form-card">

          <form
            onSubmit={
              handleSubmit
            }
          >

            <div className="nueva-solicitud-form-header">

              <div>

                <span>
                  INFORMACIÓN
                </span>

                <h3>
                  Datos de la solicitud
                </h3>

                <p>
                  Completa los datos necesarios para registrar tu solicitud.
                </p>

              </div>

            </div>

            {/* =================================================
                TÍTULO
            ================================================= */}

            <div className="nueva-solicitud-form-group">

              <label
                htmlFor="titulo"
              >
                Título
              </label>

              <input
                id="titulo"
                name="titulo"
                type="text"
                value={
                  formulario.titulo
                }
                onChange={
                  handleChange
                }
                placeholder="Ej: Problema con mi computador"
                disabled={
                  loading
                }
              />

            </div>

            {/* =================================================
                DESCRIPCIÓN
            ================================================= */}

            <div className="nueva-solicitud-form-group">

              <label
                htmlFor="descripcion"
              >
                Descripción
              </label>

              <textarea
                id="descripcion"
                name="descripcion"
                value={
                  formulario.descripcion
                }
                onChange={
                  handleChange
                }
                placeholder="Describe detalladamente el problema..."
                rows="5"
                disabled={
                  loading
                }
              />

            </div>

            {/* =================================================
                SELECTORES
            ================================================= */}

            <div className="nueva-solicitud-form-row">

              <div className="nueva-solicitud-form-group">

                <label
                  htmlFor="categoriaId"
                >
                  Categoría
                </label>

                <select
                  id="categoriaId"
                  name="categoriaId"
                  value={
                    formulario.categoriaId
                  }
                  onChange={
                    handleChange
                  }
                  disabled={
                    loading ||
                    loadingCategorias
                  }
                >

                  <option value="">

                    {loadingCategorias
                      ? "Cargando categorías..."
                      : "Selecciona una categoría"}

                  </option>

                  {categorias.map(
                    (categoria) => (

                      <option
                        key={
                          categoria.id
                        }
                        value={
                          categoria.id
                        }
                      >

                        {categoria.nombre ||
                          categoria.name ||
                          categoria.descripcion ||
                          "Categoría"}

                      </option>

                    )
                  )}

                </select>

              </div>

              <div className="nueva-solicitud-form-group">

                <label
                  htmlFor="prioridadId"
                >
                  Prioridad
                </label>

                <select
                  id="prioridadId"
                  name="prioridadId"
                  value={
                    formulario.prioridadId
                  }
                  onChange={
                    handleChange
                  }
                  disabled={
                    loading ||
                    loadingPrioridades
                  }
                >

                  <option value="">

                    {loadingPrioridades
                      ? "Cargando prioridades..."
                      : "Selecciona una prioridad"}

                  </option>

                  {prioridades.map(
                    (prioridad) => (

                      <option
                        key={
                          prioridad.id
                        }
                        value={
                          prioridad.id
                        }
                      >

                        {prioridad.nombre ||
                          prioridad.name ||
                          prioridad.descripcion ||
                          "Prioridad"}

                      </option>

                    )
                  )}

                </select>

              </div>

            </div>

            {/* =================================================
                MENSAJES
            ================================================= */}

            {error && (

              <div className="nueva-solicitud-message error">

                <AlertCircle size={18} />

                <span>
                  {error}
                </span>

              </div>

            )}

            {success && (

              <div className="nueva-solicitud-message success">

                <CheckCircle2 size={18} />

                <span>
                  {success}
                </span>

              </div>

            )}

            {/* =================================================
                ACCIONES
            ================================================= */}

            <div className="nueva-solicitud-form-actions">

              <button
                type="button"
                className="nueva-solicitud-secondary-button"
                onClick={() =>
                  navigate(
                    "/solicitudes"
                  )
                }
                disabled={
                  loading
                }
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="nueva-solicitud-primary-button"
                disabled={
                  loading
                }
              >

                <Send size={17} />

                <span>

                  {loading
                    ? "Creando solicitud..."
                    : "Crear solicitud"}

                </span>

              </button>

            </div>

          </form>

        </section>

      </main>

      <footer className="nueva-solicitud-footer">

        Desarrollado por Alexis Poblete y Damian Villanueva
        {" | "}
        Desarrollo Cloud Native 2026

      </footer>

    </div>
  );
}

export default NuevaSolicitud;