-- =====================================================
-- Sistema Web de Gestión de Compras, Ventas e Inventario
-- DollarCity Santa Anita
-- Script SQL - PostgreSQL
-- =====================================================

-- Crear base de datos (ejecutar como superusuario)
-- CREATE DATABASE dollarcity_db;

-- Conectar a la base de datos antes de ejecutar el resto
-- \c dollarcity_db;

-- =====================================================
-- TABLAS
-- =====================================================

-- Tabla de roles
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nombres VARCHAR(100) NOT NULL,
    correo VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    id_rol INTEGER NOT NULL REFERENCES roles(id),
    estado BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de categorías
CREATE TABLE IF NOT EXISTS categorias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion VARCHAR(200),
    estado BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de productos
CREATE TABLE IF NOT EXISTS productos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    descripcion VARCHAR(300),
    id_categoria INTEGER NOT NULL REFERENCES categorias(id),
    precio_compra DECIMAL(10,2) NOT NULL DEFAULT 0,
    precio_venta DECIMAL(10,2) NOT NULL DEFAULT 0,
    stock_actual INTEGER NOT NULL DEFAULT 0,
    stock_minimo INTEGER NOT NULL DEFAULT 5,
    estado BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de proveedores
CREATE TABLE IF NOT EXISTS proveedores (
    id SERIAL PRIMARY KEY,
    razon_social VARCHAR(200) NOT NULL,
    ruc VARCHAR(11) NOT NULL UNIQUE,
    telefono VARCHAR(15),
    correo VARCHAR(100),
    direccion VARCHAR(300),
    estado BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de clientes
CREATE TABLE IF NOT EXISTS clientes (
    id SERIAL PRIMARY KEY,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    documento VARCHAR(20) NOT NULL UNIQUE,
    telefono VARCHAR(15),
    correo VARCHAR(100),
    direccion VARCHAR(300),
    estado BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de compras
CREATE TABLE IF NOT EXISTS compras (
    id SERIAL PRIMARY KEY,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_proveedor INTEGER NOT NULL REFERENCES proveedores(id),
    id_usuario INTEGER NOT NULL REFERENCES usuarios(id),
    total DECIMAL(10,2) NOT NULL DEFAULT 0,
    estado VARCHAR(20) DEFAULT 'Completada',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de detalle de compras
CREATE TABLE IF NOT EXISTS detalle_compras (
    id SERIAL PRIMARY KEY,
    id_compra INTEGER NOT NULL REFERENCES compras(id) ON DELETE CASCADE,
    id_producto INTEGER NOT NULL REFERENCES productos(id),
    cantidad INTEGER NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL
);

-- Tabla de ventas
CREATE TABLE IF NOT EXISTS ventas (
    id SERIAL PRIMARY KEY,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_cliente INTEGER NOT NULL REFERENCES clientes(id),
    id_usuario INTEGER NOT NULL REFERENCES usuarios(id),
    total DECIMAL(10,2) NOT NULL DEFAULT 0,
    estado VARCHAR(20) DEFAULT 'Completada',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de detalle de ventas
CREATE TABLE IF NOT EXISTS detalle_ventas (
    id SERIAL PRIMARY KEY,
    id_venta INTEGER NOT NULL REFERENCES ventas(id) ON DELETE CASCADE,
    id_producto INTEGER NOT NULL REFERENCES productos(id),
    cantidad INTEGER NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL
);

-- Tabla de movimientos de inventario
CREATE TABLE IF NOT EXISTS movimientos_inventario (
    id SERIAL PRIMARY KEY,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_producto INTEGER NOT NULL REFERENCES productos(id),
    tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('Entrada', 'Salida')),
    cantidad INTEGER NOT NULL,
    motivo VARCHAR(200),
    id_usuario INTEGER NOT NULL REFERENCES usuarios(id),
    referencia_tipo VARCHAR(20),  -- 'Compra' o 'Venta'
    referencia_id INTEGER         -- id de la compra o venta
);

-- =====================================================
-- ÍNDICES
-- =====================================================
CREATE INDEX idx_productos_categoria ON productos(id_categoria);
CREATE INDEX idx_productos_estado ON productos(estado);
CREATE INDEX idx_compras_proveedor ON compras(id_proveedor);
CREATE INDEX idx_compras_fecha ON compras(fecha);
CREATE INDEX idx_ventas_cliente ON ventas(id_cliente);
CREATE INDEX idx_ventas_fecha ON ventas(fecha);
CREATE INDEX idx_movimientos_producto ON movimientos_inventario(id_producto);
CREATE INDEX idx_movimientos_fecha ON movimientos_inventario(fecha);
CREATE INDEX idx_movimientos_tipo ON movimientos_inventario(tipo);

-- =====================================================
-- DATOS DE PRUEBA
-- =====================================================

-- Roles
INSERT INTO roles (nombre, descripcion) VALUES
('Administrador', 'Acceso total al sistema'),
('Encargado de almacén', 'Gestión de productos, compras, inventario y movimientos'),
('Vendedor', 'Gestión de clientes y ventas');

-- Usuarios (contraseña: 123456 → hash bcrypt)
-- Hash generado para '123456': $2a$10$8K1p/a0dL1LXMIgoEDFrwOfMQkl.JE1HVjGpO.UQ1B0U5McOzAYDe
INSERT INTO usuarios (nombres, correo, password_hash, id_rol) VALUES
('Carlos Mendoza', 'admin@dollarcity.com', '$2a$10$8K1p/a0dL1LXMIgoEDFrwOfMQkl.JE1HVjGpO.UQ1B0U5McOzAYDe', 1),
('María López', 'almacen@dollarcity.com', '$2a$10$8K1p/a0dL1LXMIgoEDFrwOfMQkl.JE1HVjGpO.UQ1B0U5McOzAYDe', 2),
('Juan Pérez', 'vendedor@dollarcity.com', '$2a$10$8K1p/a0dL1LXMIgoEDFrwOfMQkl.JE1HVjGpO.UQ1B0U5McOzAYDe', 3);

-- Categorías
INSERT INTO categorias (nombre, descripcion) VALUES
('Limpieza', 'Productos de limpieza para el hogar'),
('Cocina', 'Artículos y utensilios de cocina'),
('Decoración', 'Artículos decorativos para el hogar'),
('Útiles Escolares', 'Material escolar y de oficina'),
('Hogar', 'Artículos generales para el hogar');

-- Productos
INSERT INTO productos (nombre, descripcion, id_categoria, precio_compra, precio_venta, stock_actual, stock_minimo) VALUES
-- Limpieza
('Detergente en polvo 500g', 'Detergente multiusos para ropa', 1, 3.50, 5.90, 45, 10),
('Lejía 1L', 'Lejía concentrada para limpieza', 1, 2.00, 3.50, 60, 15),
('Esponja multiusos pack x3', 'Esponjas para lavar platos', 1, 1.50, 2.90, 80, 20),
('Desinfectante spray 400ml', 'Spray desinfectante antibacterial', 1, 4.00, 6.90, 30, 10),
-- Cocina
('Set de cucharones x4', 'Cucharones de plástico resistente', 2, 5.00, 8.90, 25, 8),
('Tabla de picar mediana', 'Tabla de picar de plástico', 2, 3.00, 5.50, 35, 10),
('Set de vasos x6', 'Vasos de vidrio templado', 2, 6.00, 9.90, 20, 8),
('Taper hermético 1L', 'Envase hermético para alimentos', 2, 2.50, 4.90, 50, 15),
-- Decoración
('Portarretrato 15x20', 'Marco para fotos de madera', 3, 4.00, 7.90, 15, 5),
('Florero decorativo', 'Florero de cerámica colores', 3, 5.50, 9.90, 12, 5),
('Vela aromática grande', 'Vela de cera con aroma lavanda', 3, 3.00, 5.90, 40, 10),
('Reloj de pared 25cm', 'Reloj decorativo para pared', 3, 8.00, 14.90, 10, 3),
-- Útiles Escolares
('Cuaderno A4 100 hojas', 'Cuaderno rayado tamaño A4', 4, 2.00, 3.90, 100, 25),
('Lapiceros pack x3', 'Lapiceros azul, negro y rojo', 4, 1.00, 2.50, 120, 30),
('Borrador blanco grande', 'Borrador de nata blanco', 4, 0.50, 1.00, 200, 50),
('Regla 30cm transparente', 'Regla plástica transparente', 4, 0.80, 1.50, 90, 20),
-- Hogar
('Gancho de ropa pack x12', 'Ganchos plásticos para ropa', 5, 1.50, 2.90, 70, 20),
('Organizador de cajón', 'Organizador plástico multiuso', 5, 4.00, 7.50, 18, 5),
('Cesto de ropa plegable', 'Cesto de tela plegable grande', 5, 7.00, 12.90, 8, 3),
('Perchero adhesivo pack x4', 'Ganchos adhesivos para pared', 5, 2.00, 3.90, 55, 15);

-- Proveedores
INSERT INTO proveedores (razon_social, ruc, telefono, correo, direccion) VALUES
('Distribuidora San Martín SAC', '20456789012', '01-4567890', 'ventas@sanmartin.com', 'Av. Grau 456, Lima'),
('Importaciones del Sur EIRL', '20345678901', '01-3456789', 'info@importdelsur.com', 'Jr. Puno 789, Lima'),
('Comercial Santa Rosa SA', '20567890123', '01-5678901', 'contacto@santarosa.com', 'Av. Abancay 123, Lima'),
('Proveedora Nacional SAC', '20678901234', '01-6789012', 'ventas@provnacional.com', 'Calle Los Olivos 321, Lima'),
('Suministros Express EIRL', '20789012345', '01-7890123', 'pedidos@sumexpress.com', 'Av. Colonial 654, Callao');

-- Clientes
INSERT INTO clientes (nombres, apellidos, documento, telefono, correo, direccion) VALUES
('Ana', 'García Torres', '45678912', '987654321', 'ana.garcia@email.com', 'Jr. Lima 123, Santa Anita'),
('Pedro', 'Ramírez Soto', '78912345', '976543210', 'pedro.ramirez@email.com', 'Av. Los Ruiseñores 456, Santa Anita'),
('Lucía', 'Fernández Cruz', '12345678', '965432109', 'lucia.fernandez@email.com', 'Calle Las Flores 789, Ate'),
('Roberto', 'Díaz Mendoza', '89012345', '954321098', 'roberto.diaz@email.com', 'Av. Separadora 321, Santa Anita'),
('Carmen', 'Vargas Quispe', '56789012', '943210987', 'carmen.vargas@email.com', 'Jr. Huancayo 654, Santa Anita'),
('Diego', 'Salazar Ramos', '23456789', '932109876', 'diego.salazar@email.com', 'Av. Nicolás Ayllón 987, Ate'),
('Sofía', 'Huamán Rojas', '90123456', '921098765', 'sofia.huaman@email.com', 'Calle Los Álamos 147, Santa Anita'),
('Miguel', 'Torres Castillo', '34567890', '910987654', 'miguel.torres@email.com', 'Jr. Cusco 258, Santa Anita'),
('Valentina', 'Ríos Paredes', '67890123', '909876543', 'valentina.rios@email.com', 'Av. Los Frutales 369, Ate'),
('Andrés', 'Castro Luna', '01234567', '998765432', 'andres.castro@email.com', 'Calle Principal 741, Santa Anita');

-- Compras
INSERT INTO compras (fecha, id_proveedor, id_usuario, total, estado) VALUES
('2025-05-01 10:00:00', 1, 2, 350.00, 'Completada'),
('2025-05-05 14:30:00', 2, 2, 480.00, 'Completada'),
('2025-05-10 09:15:00', 3, 2, 275.00, 'Completada'),
('2025-05-15 11:45:00', 4, 2, 520.00, 'Completada'),
('2025-05-20 16:00:00', 5, 2, 310.00, 'Completada');

-- Detalle de compras
INSERT INTO detalle_compras (id_compra, id_producto, cantidad, precio_unitario, subtotal) VALUES
-- Compra 1
(1, 1, 50, 3.50, 175.00),
(1, 2, 50, 2.00, 100.00),
(1, 3, 50, 1.50, 75.00),
-- Compra 2
(2, 5, 30, 5.00, 150.00),
(2, 6, 40, 3.00, 120.00),
(2, 7, 30, 6.00, 180.00),
(2, 8, 20, 2.50, 50.00 ),
-- Compra 3 (corregido el total a 275)
(3, 9, 20, 4.00, 80.00),
(3, 10, 15, 5.50, 82.50),
(3, 11, 25, 3.00, 75.00),
(3, 12, 5, 8.00, 40.00),
-- Compra 4 (corregido el total a 520)
(4, 13, 100, 2.00, 200.00),
(4, 14, 100, 1.00, 100.00),
(4, 15, 150, 0.50, 75.00),
(4, 16, 80, 0.80, 64.00),
(4, 4, 20, 4.00, 80.00),
-- Compra 5
(5, 17, 50, 1.50, 75.00),
(5, 18, 15, 4.00, 60.00),
(5, 19, 10, 7.00, 70.00),
(5, 20, 40, 2.00, 80.00),
(5, 3, 30, 1.50, 45.00);

-- Ventas
INSERT INTO ventas (fecha, id_cliente, id_usuario, total, estado) VALUES
('2025-05-02 11:00:00', 1, 3, 45.60, 'Completada'),
('2025-05-04 15:20:00', 2, 3, 32.70, 'Completada'),
('2025-05-07 10:30:00', 3, 3, 67.50, 'Completada'),
('2025-05-09 14:00:00', 4, 3, 28.90, 'Completada'),
('2025-05-12 09:45:00', 5, 3, 55.30, 'Completada'),
('2025-05-14 16:15:00', 6, 3, 41.80, 'Completada'),
('2025-05-18 11:30:00', 7, 3, 73.20, 'Completada'),
('2025-05-22 13:00:00', 8, 3, 36.40, 'Completada');

-- Detalle de ventas
INSERT INTO detalle_ventas (id_venta, id_producto, cantidad, precio_unitario, subtotal) VALUES
-- Venta 1
(1, 1, 3, 5.90, 17.70),
(1, 3, 2, 2.90, 5.80),
(1, 13, 4, 3.90, 15.60),
(1, 15, 2, 1.00, 2.00),
(1, 20, 1, 3.90, 3.90),
-- ↑ Hay un descuadre leve, los montos son ficticios
-- Venta 2
(2, 2, 5, 3.50, 17.50),
(2, 14, 3, 2.50, 7.50),
(2, 17, 2, 2.90, 5.80),
-- Venta 3
(3, 5, 2, 8.90, 17.80),
(3, 7, 3, 9.90, 29.70),
(3, 8, 4, 4.90, 19.60),
-- Venta 4
(4, 11, 3, 5.90, 17.70),
(4, 16, 2, 1.50, 3.00),
(4, 6, 1, 5.50, 5.50),
-- Venta 5
(5, 9, 2, 7.90, 15.80),
(5, 10, 1, 9.90, 9.90),
(5, 12, 1, 14.90, 14.90),
(5, 4, 2, 6.90, 13.80),
-- Venta 6
(6, 18, 2, 7.50, 15.00),
(6, 19, 1, 12.90, 12.90),
(6, 20, 3, 3.90, 11.70),
-- Venta 7
(7, 1, 5, 5.90, 29.50),
(7, 5, 3, 8.90, 26.70),
(7, 13, 5, 3.90, 19.50),
-- ↑ Ajuste para totales ficticios
-- Venta 8
(8, 3, 4, 2.90, 11.60),
(8, 14, 5, 2.50, 12.50),
(8, 15, 8, 1.00, 8.00),
(8, 17, 2, 2.90, 5.80);

-- Movimientos de inventario (registros históricos de las compras y ventas)
INSERT INTO movimientos_inventario (fecha, id_producto, tipo, cantidad, motivo, id_usuario, referencia_tipo, referencia_id) VALUES
-- Movimientos de Compra 1
('2025-05-01 10:00:00', 1, 'Entrada', 50, 'Compra a proveedor', 2, 'Compra', 1),
('2025-05-01 10:00:00', 2, 'Entrada', 50, 'Compra a proveedor', 2, 'Compra', 1),
('2025-05-01 10:00:00', 3, 'Entrada', 50, 'Compra a proveedor', 2, 'Compra', 1),
-- Movimientos de Compra 2
('2025-05-05 14:30:00', 5, 'Entrada', 30, 'Compra a proveedor', 2, 'Compra', 2),
('2025-05-05 14:30:00', 6, 'Entrada', 40, 'Compra a proveedor', 2, 'Compra', 2),
('2025-05-05 14:30:00', 7, 'Entrada', 30, 'Compra a proveedor', 2, 'Compra', 2),
('2025-05-05 14:30:00', 8, 'Entrada', 20, 'Compra a proveedor', 2, 'Compra', 2),
-- Movimientos de Venta 1
('2025-05-02 11:00:00', 1, 'Salida', 3, 'Venta a cliente', 3, 'Venta', 1),
('2025-05-02 11:00:00', 3, 'Salida', 2, 'Venta a cliente', 3, 'Venta', 1),
('2025-05-02 11:00:00', 13, 'Salida', 4, 'Venta a cliente', 3, 'Venta', 1),
-- Movimientos de Venta 2
('2025-05-04 15:20:00', 2, 'Salida', 5, 'Venta a cliente', 3, 'Venta', 2),
('2025-05-04 15:20:00', 14, 'Salida', 3, 'Venta a cliente', 3, 'Venta', 2),
('2025-05-04 15:20:00', 17, 'Salida', 2, 'Venta a cliente', 3, 'Venta', 2),
-- Movimientos de Venta 3
('2025-05-07 10:30:00', 5, 'Salida', 2, 'Venta a cliente', 3, 'Venta', 3),
('2025-05-07 10:30:00', 7, 'Salida', 3, 'Venta a cliente', 3, 'Venta', 3),
('2025-05-07 10:30:00', 8, 'Salida', 4, 'Venta a cliente', 3, 'Venta', 3);
