-- Esquema de referencia para PostgreSQL en EC2.
CREATE TABLE IF NOT EXISTS solicitudes (
    id BIGSERIAL PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    descripcion VARCHAR(4000) NOT NULL,
    categoria_id BIGINT NOT NULL,
    prioridad_id BIGINT NOT NULL,
    usuario_solicitante VARCHAR(150) NOT NULL,
    estado VARCHAR(30) NOT NULL,
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_solicitudes_estado CHECK (
        estado IN ('CREADA', 'ASIGNADA', 'EN_PROCESO', 'RESUELTA', 'CERRADA', 'CANCELADA')
    )
);

-- Acelera GET /v1/solicitudes/mias.
CREATE INDEX IF NOT EXISTS idx_solicitudes_usuario_fecha
    ON solicitudes (usuario_solicitante, fecha_creacion DESC);
