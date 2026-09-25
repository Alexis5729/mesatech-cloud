{modoAdministracion && esAdministrador && (
  <section className="admin-prioridades">

    <div className="admin-form-header">
      <div>
        <span>ADMINISTRACIÓN</span>
        <h3>Prioridades</h3>
      </div>

      <button
        type="button"
        className="primary-button"
        onClick={() => {
          setPrioridadEditando(null);
          setNuevaPrioridad({
            nombre: "",
            descripcion: "",
          });
        }}
      >
        Nueva prioridad
      </button>
    </div>

    {modoAdministracion && prioridadEditando === null && (
      <div className="priority-form">

        <div className="form-group">
          <label htmlFor="nombrePrioridad">
            Nombre de la prioridad
          </label>

          <input
            id="nombrePrioridad"
            type="text"
            value={nuevaPrioridad.nombre}
            onChange={(e) =>
              setNuevaPrioridad((prev) => ({
                ...prev,
                nombre: e.target.value,
              }))
            }
            placeholder="Ej: Alta"
          />
        </div>

        <div className="form-group">
          <label htmlFor="descripcionPrioridad">
            Descripción
          </label>

          <textarea
            id="descripcionPrioridad"
            value={nuevaPrioridad.descripcion}
            onChange={(e) =>
              setNuevaPrioridad((prev) => ({
                ...prev,
                descripcion: e.target.value,
              }))
            }
            placeholder="Describe esta prioridad..."
            rows="3"
          />
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={crearPrioridad}
        >
          Crear prioridad
        </button>

      </div>
    )}

    {loadingPrioridades ? (
      <p>Cargando prioridades...</p>
    ) : prioridades.length === 0 ? (
      <p>No hay prioridades registradas.</p>
    ) : (
      <div className="priority-list">

        {prioridades.map((prioridad) => (
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
                {prioridad.descripcion ||
                  prioridad.description ||
                  "Sin descripción"}
              </p>
            </div>

          </article>
        ))}

      </div>
    )}

  </section>
)}