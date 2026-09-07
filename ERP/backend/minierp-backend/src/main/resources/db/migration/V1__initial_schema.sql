-- V1__initial_schema.sql
-- Esquema inicial del Mini ERP (solo estructura de tablas)

-- 1. ÁREAS (catálogo de roles)
-- Catálogo de áreas/roles del sistema (ADMINISTRACION, COMPRAS, VENTAS, INVENTARIO)
CREATE TABLE areas (
    id              BIGSERIAL PRIMARY KEY,
    nombre          VARCHAR(30)     NOT NULL UNIQUE,	-- Nombre único del área
    descripcion     VARCHAR(255)	-- Descripción opcional del área
);

-- 2. USUARIOS
-- Usuarios del sistema (empleados). Cada uno pertenece a un área.
CREATE TABLE usuarios (
    id              BIGSERIAL PRIMARY KEY,
    nombre          VARCHAR(120)        NOT NULL,
    email           VARCHAR(150)        NOT NULL UNIQUE,	-- Correo electrónico, se usa como nombre de usuario para autenticación.
    password_hash   VARCHAR(255)        NOT NULL,	-- Hash de la contraseña generado con BCrypt.
    area_id         BIGINT              NOT NULL REFERENCES areas(id),	-- Referencia al área/rol del usuario 
    activo          BOOLEAN             NOT NULL DEFAULT TRUE	-- Para manejar eliminaciones 
);

CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_area ON usuarios(area_id);

-- 3. CATEGORÍAS
-- Categorías para clasificar los productos (Electrónica, Oficina, Limpieza, etc.)
CREATE TABLE categorias (
    id              BIGSERIAL PRIMARY KEY,
    nombre          VARCHAR(80)         NOT NULL UNIQUE,
    descripcion     VARCHAR(255)
);

-- 4. PRODUCTOS
-- Catálogo de productos que la empresa compra y vende.
CREATE TABLE productos (
    id              BIGSERIAL PRIMARY KEY,
    codigo          VARCHAR(20)         NOT NULL UNIQUE,	-- Código único interno del producto (ej. PRD-001).
    nombre          VARCHAR(150)        NOT NULL,
    descripcion     VARCHAR(255),
    categoria_id    BIGINT              NOT NULL REFERENCES categorias(id),
    precio_compra   NUMERIC(12,2)       NOT NULL CHECK (precio_compra >= 0),	-- Último precio de compra conocido (referencia)
    precio_venta    NUMERIC(12,2)       NOT NULL CHECK (precio_venta >= 0),	-- Precio de venta al público sugerido
    unidad_medida   VARCHAR(20)         NOT NULL DEFAULT 'UND',
    stock_actual    INTEGER             NOT NULL DEFAULT 0 CHECK (stock_actual >= 0),	-- Cantidad disponible en inventario
    stock_minimo    INTEGER             NOT NULL DEFAULT 5,	-- Umbral para alerta de bajo stock
    activo          BOOLEAN             NOT NULL DEFAULT TRUE
);

CREATE INDEX idx_productos_categoria ON productos(categoria_id);
CREATE INDEX idx_productos_codigo ON productos(codigo);
CREATE INDEX idx_productos_nombre ON productos(nombre);

-- 5. PROVEEDORES
-- Proveedores que suministran los productos a la empresa
CREATE TABLE proveedores (
    id              BIGSERIAL PRIMARY KEY,
    nombre          VARCHAR(150)        NOT NULL,
    nit             VARCHAR(30)         NOT NULL UNIQUE,	-- NIT, único para cada proveedor
    telefono        VARCHAR(30),
    email           VARCHAR(150),
    direccion       VARCHAR(255),
    activo          BOOLEAN             NOT NULL DEFAULT TRUE
);

-- 6. CLIENTES
-- Clientes que compran productos a la empresa
CREATE TABLE clientes (
    id                  BIGSERIAL PRIMARY KEY,
    nombre              VARCHAR(150)    NOT NULL,
    tipo_documento      VARCHAR(10)     NOT NULL DEFAULT 'CC',	-- Tipo de documento (CC, NIT, CE, etc.)
    numero_documento    VARCHAR(30)     NOT NULL UNIQUE,	-- Número de documento, único para cada cliente
    telefono            VARCHAR(30),
    email               VARCHAR(150),
    direccion           VARCHAR(255),
    activo              BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW()
);

-- 7. COMPRAS
-- Registro de compras realizadas a proveedores
CREATE TABLE compras (
    id              BIGSERIAL PRIMARY KEY,
    numero_compra   VARCHAR(20)         NOT NULL UNIQUE,	-- Número de compra, único para facturación y seguimiento
    proveedor_id    BIGINT              NOT NULL REFERENCES proveedores(id),
    usuario_id      BIGINT              NOT NULL REFERENCES usuarios(id),	-- Usuario del área de Compras que registró la operación
    fecha           TIMESTAMP           NOT NULL DEFAULT NOW(),
    subtotal        NUMERIC(14,2)       NOT NULL DEFAULT 0,
    impuesto        NUMERIC(14,2)       NOT NULL DEFAULT 0,
    total           NUMERIC(14,2)       NOT NULL DEFAULT 0,
    estado          VARCHAR(20)         NOT NULL DEFAULT 'COMPLETADA'
                        CHECK (estado IN ('PENDIENTE','COMPLETADA','ANULADA')) -- Estado: PENDIENTE, COMPLETADA, ANULADA.
);

-- 8. DETALLE DE COMPRAS
-- Detalle de cada compra, con productos, cantidades y precios de compra
CREATE TABLE detalle_compras (
    id              BIGSERIAL PRIMARY KEY,
    compra_id       BIGINT              NOT NULL REFERENCES compras(id) ON DELETE CASCADE,
    producto_id     BIGINT              NOT NULL REFERENCES productos(id),
    cantidad        INTEGER             NOT NULL CHECK (cantidad > 0),
    precio_unitario NUMERIC(12,2)       NOT NULL CHECK (precio_unitario >= 0),
    subtotal        NUMERIC(14,2)       NOT NULL
);

CREATE INDEX idx_detalle_compras_compra ON detalle_compras(compra_id);
CREATE INDEX idx_detalle_compras_producto ON detalle_compras(producto_id);

-- 9. VENTAS
-- Registro de ventas realizadas a clientes
CREATE TABLE ventas (
    id              BIGSERIAL PRIMARY KEY,
    numero_venta    VARCHAR(20)         NOT NULL UNIQUE,	-- Número de venta, único para facturación y seguimiento
    cliente_id      BIGINT              NOT NULL REFERENCES clientes(id),
    usuario_id      BIGINT              NOT NULL REFERENCES usuarios(id),	-- Usuario del área de Ventas que registró la operación
    fecha           TIMESTAMP           NOT NULL DEFAULT NOW(),
    subtotal        NUMERIC(14,2)       NOT NULL DEFAULT 0,
    impuesto        NUMERIC(14,2)       NOT NULL DEFAULT 0,
    total           NUMERIC(14,2)       NOT NULL DEFAULT 0,
    estado          VARCHAR(20)         NOT NULL DEFAULT 'COMPLETADA'
                        CHECK (estado IN ('PENDIENTE','COMPLETADA','ANULADA'))
);

-- 10. DETALLE DE VENTAS
-- Detalle de cada venta, con productos, cantidades y precios de venta
CREATE TABLE detalle_ventas (
    id              BIGSERIAL PRIMARY KEY,
    venta_id        BIGINT              NOT NULL REFERENCES ventas(id) ON DELETE CASCADE,
    producto_id     BIGINT              NOT NULL REFERENCES productos(id),
    cantidad        INTEGER             NOT NULL CHECK (cantidad > 0),
    precio_unitario NUMERIC(12,2)       NOT NULL CHECK (precio_unitario >= 0),
    subtotal        NUMERIC(14,2)       NOT NULL
);

CREATE INDEX idx_detalle_ventas_venta ON detalle_ventas(venta_id);
CREATE INDEX idx_detalle_ventas_producto ON detalle_ventas(producto_id);

-- 11. MOVIMIENTOS DE INVENTARIO
-- Trazabilidad de todos los movimientos de inventario (entradas y salidas)
CREATE TABLE movimientos_inventario (
    id                  BIGSERIAL PRIMARY KEY,
    producto_id         BIGINT          NOT NULL REFERENCES productos(id),
    tipo_movimiento     VARCHAR(10)     NOT NULL CHECK (tipo_movimiento IN ('ENTRADA','SALIDA')),
    cantidad            INTEGER         NOT NULL CHECK (cantidad > 0),
    saldo_disponible    INTEGER         NOT NULL DEFAULT 0,	-- Para ENTRADAS: cantidad del lote aún no vendida. Para SALIDAS: 0. Esencial para UEPS/PEPS.
    costo_unitario      NUMERIC(12,2)   NOT NULL CHECK (costo_unitario >= 0),	-- Costo por unidad en este movimiento
    stock_anterior      INTEGER         NOT NULL,
    stock_nuevo         INTEGER         NOT NULL,
    referencia_tipo     VARCHAR(10)     NOT NULL CHECK (referencia_tipo IN ('COMPRA','VENTA')),
    referencia_id       BIGINT          NOT NULL,	-- ID de la compra o venta que origina el movimiento
    usuario_id          BIGINT          NOT NULL REFERENCES usuarios(id),
    fecha               TIMESTAMP       NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_movimientos_producto ON movimientos_inventario(producto_id);
CREATE INDEX idx_movimientos_referencia ON movimientos_inventario(referencia_tipo, referencia_id);
CREATE INDEX idx_movimientos_fecha ON movimientos_inventario(fecha);

-- 12. LOG DE AUDITORÍA
-- Histórico de auditoría de acciones relevantes de los usuarios
CREATE TABLE log_auditoria (
    id              BIGSERIAL PRIMARY KEY,
    usuario_id      BIGINT      NOT NULL REFERENCES usuarios(id),
    fecha           TIMESTAMP   NOT NULL DEFAULT NOW(),
    modulo          VARCHAR(50) NOT NULL,	-- Módulo afectado: PRODUCTOS, COMPRAS, VENTAS, INVENTARIO, USUARIOS, etc.
    tipo_accion     VARCHAR(20) NOT NULL,	-- CREAR, ACTUALIZAR, ELIMINAR, CONSULTAR, CANCELAR, etc.
    detalle         TEXT,	-- Descripción detallada de la acción y datos afectados
    ip_origen       VARCHAR(45)
);

CREATE INDEX idx_log_auditoria_usuario ON log_auditoria(usuario_id);
CREATE INDEX idx_log_auditoria_fecha ON log_auditoria(fecha);
CREATE INDEX idx_log_auditoria_modulo ON log_auditoria(modulo);
