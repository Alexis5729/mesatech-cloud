import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMsal } from "@azure/msal-react";
import { apiPost } from "../services/api";
import "./NuevaSolicitud.css";

function NuevaSolicitud() {
  const navigate = useNavigate();
  const { accounts } = useMsal();

  const account = accounts[0];

  const [formulario, setFormulario] = useState({
    titulo: "",
    descripcion: "",
    categoria: "",
    prioridad: "MEDIA",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormulario((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!formulario.titulo.trim()) {
      setError("Debes ingresar un título.");
      return;
    }

    if (!formulario.descripcion.trim()) {
      setError("Debes ingresar una descripción.");
      return;
    }

    if (!formulario.categoria) {
      setError("Debes seleccionar una categoría.");
      return;
    }

    try {
      setLoading(true);

      const solicitud = await apiPost(
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
        categoria: "",
        prioridad: "MEDIA",
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

  return (
    <div className="nueva-solicitud-page">

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

      <main className="nueva-solicitud-content">

      


        <section className="page-title">

          <span>
            SOLICITUDES
          </span>

          <h2>
            Nueva solicitud
          </h2>

          <p>
            Registra una nueva solicitud de soporte.
          </p>

        </section>


        {/* FORMULARIO */}

        <section className="form-card">

          <form onSubmit={handleSubmit}>

            <div className="form-section">

              <h3>
                Información de la solicitud
              </h3>

              <p>
                Completa los datos necesarios
                para registrar tu solicitud.
              </p>

            </div>


            {/* TÍTULO */}

            <div className="form-group">

              <label htmlFor="titulo">
                Título
              </label>

              <input
                id="titulo"
                name="titulo"
                type="text"
                value={formulario.titulo}
                onChange={handleChange}
                placeholder="Ej: Problema con mi computador"
                disabled={loading}
              />

            </div>


            {/* DESCRIPCIÓN */}

            <div className="form-group">

              <label htmlFor="descripcion">
                Descripción
              </label>

              <textarea
                id="descripcion"
                name="descripcion"
                value={formulario.descripcion}
                onChange={handleChange}
                placeholder="Describe detalladamente el problema..."
                rows="5"
                disabled={loading}
              />

            </div>


            <div className="form-row">

              {/* CATEGORÍA */}

              <div className="form-group">

                <label htmlFor="categoria">
                  Categoría
                </label>

                <select
                  id="categoria"
                  name="categoria"
                  value={formulario.categoria}
                  onChange={handleChange}
                  disabled={loading}
                >

                  <option value="">
                    Selecciona una categoría
                  </option>

                  <option value="HARDWARE">
                    Hardware
                  </option>

                  <option value="SOFTWARE">
                    Software
                  </option>

                  <option value="REDES">
                    Redes
                  </option>

                  <option value="ACCESOS">
                    Accesos
                  </option>

                </select>

              </div>


              {/* PRIORIDAD */}

              <div className="form-group">

                <label htmlFor="prioridad">
                  Prioridad
                </label>

                <select
                  id="prioridad"
                  name="prioridad"
                  value={formulario.prioridad}
                  onChange={handleChange}
                  disabled={loading}
                >

                  <option value="BAJA">
                    Baja
                  </option>

                  <option value="MEDIA">
                    Media
                  </option>

                  <option value="ALTA">
                    Alta
                  </option>

                </select>

              </div>

            </div>


            {/* MENSAJES */}

            {error && (
              <div className="form-message error">
                 {error}
              </div>
            )}

            {success && (
              <div className="form-message success">
                 {success}
              </div>
            )}


            {/* BOTONES */}

            <div className="form-actions">

              <button
                type="button"
                className="secondary-button"
                onClick={() => navigate("/solicitudes")}
                disabled={loading}
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="primary-button"
                disabled={loading}
              >
                {loading
                  ? "Creando solicitud..."
                  : "Crear solicitud"}
              </button>

            </div>

          </form>

        </section>

      </main>
       <footer className="developer-signature">

          Desarrollado por Alexis Poblete, Damian Villanueva y Francisco Vásquez | Sistema creado para la asignatura de Desarrollo Cloud Native 2026

        </footer>

    </div>
  );
}

export default NuevaSolicitud;