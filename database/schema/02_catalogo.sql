-- Tablas de catálogo para PostgreSQL en EC2.
CREATE TABLE IF NOT EXISTS categorias (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion VARCHAR(300)
);

CREATE TABLE IF NOT EXISTS prioridades (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    nivel INTEGER NOT NULL UNIQUE,
    CONSTRAINT chk_prioridades_nivel_positivo CHECK (nivel > 0)
);

-- Datos iniciales sencillos para la demostración de la EP1.
INSERT INTO categorias (nombre, descripcion) VALUES
    ('Hardware', 'Equipos y periféricos'),
    ('Software', 'Aplicaciones y sistemas'),
    ('Accesos', 'Cuentas, permisos y contraseñas'),
    ('Conectividad', 'Red, Wi-Fi y VPN')
ON CONFLICT DO NOTHING;

INSERT INTO prioridades (nombre, nivel) VALUES
    ('Baja', 1),
    ('Media', 2),
    ('Alta', 3),
    ('Crítica', 4)
ON CONFLICT DO NOTHING;
