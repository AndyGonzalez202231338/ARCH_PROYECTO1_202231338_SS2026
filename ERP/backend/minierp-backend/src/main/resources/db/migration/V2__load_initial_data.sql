-- V2__load_initial_data.sql
-- Datos iniciales de prueba para el Mini ERP
-- Password de todos los usuarios de prueba: password123

-- ---------------------------------------------------------
-- ÁREAS
-- ---------------------------------------------------------
INSERT INTO areas (nombre, descripcion) VALUES
    ('ADMINISTRACION', 'Supervisión general y toma de decisiones'),
    ('COMPRAS', 'Gestión de abastecimiento y proveedores'),
    ('VENTAS', 'Comercialización de productos a clientes'),
    ('INVENTARIO', 'Control de existencias y movimientos');

-- ---------------------------------------------------------
-- USUARIOS
-- ---------------------------------------------------------
INSERT INTO usuarios (nombre, email, password_hash, area_id, activo) VALUES
    ('Ana Morales', 'ana.compras@minierp.com', '$2b$10$8kbq4I9dzVjWRoibHgV1FunKgBJ/4X9P8M/55r8H0AfNahl0mHCua', 2, true),
    ('Carlos Pérez', 'carlos.ventas@minierp.com', '$2b$10$8kbq4I9dzVjWRoibHgV1FunKgBJ/4X9P8M/55r8H0AfNahl0mHCua', 3, true),
    ('Diana Ruiz', 'diana.inventario@minierp.com', '$2b$10$8kbq4I9dzVjWRoibHgV1FunKgBJ/4X9P8M/55r8H0AfNahl0mHCua', 4, true),
    ('Jorge Salazar', 'jorge.admin@minierp.com', '$2b$10$8kbq4I9dzVjWRoibHgV1FunKgBJ/4X9P8M/55r8H0AfNahl0mHCua', 1, true);

-- ---------------------------------------------------------
-- CATEGORÍAS
-- ---------------------------------------------------------
INSERT INTO categorias (nombre, descripcion) VALUES
    ('Electronica', 'Dispositivos electrónicos y accesorios'),
    ('Oficina', 'Artículos de oficina y papelería en general'),
    ('Limpieza', 'Productos de limpieza y aseo'),
    ('Alimentos y Bebidas', 'Productos de consumo humano'),
    ('Ferreteria', 'Herramientas y artículos de ferretería'),
    ('Papeleria', 'Artículos de papelería fina');

-- ---------------------------------------------------------
-- PRODUCTOS (30)
-- ---------------------------------------------------------
INSERT INTO productos (codigo, nombre, descripcion, categoria_id, precio_compra, precio_venta, unidad_medida, stock_minimo) VALUES
    ('PRD-001', 'Mouse inalámbrico', 'Mouse óptico inalámbrico 2.4GHz', 1, 25000, 45000, 'UND', 10),
    ('PRD-002', 'Teclado inalámbrico', 'Teclado compacto inalámbrico', 1, 42000, 75000, 'UND', 8),
    ('PRD-003', 'Audífonos Bluetooth', 'Audífonos estéreo Bluetooth', 1, 55000, 95000, 'UND', 6),
    ('PRD-004', 'Memoria USB 64GB', 'Memoria USB 3.0 de 64GB', 1, 30000, 52000, 'UND', 10),
    ('PRD-005', 'Disco SSD 500GB', 'Unidad SSD SATA 500GB', 1, 180000, 265000, 'UND', 5),
    ('PRD-006', 'Monitor 24 pulgadas', 'Monitor LED Full HD 24 pulgadas', 1, 520000, 720000, 'UND', 4),
    ('PRD-007', 'Webcam HD', 'Cámara web HD con micrófono', 1, 95000, 145000, 'UND', 5),
    ('PRD-008', 'Hub USB', 'Hub USB 3.0 de 4 puertos', 1, 45000, 75000, 'UND', 6),
    ('PRD-009', 'Resma carta', 'Papel carta 75g, 500 hojas', 2, 18000, 28000, 'RES', 20),
    ('PRD-010', 'Cuaderno ejecutivo', 'Cuaderno de 100 hojas', 2, 12000, 20000, 'UND', 15),
    ('PRD-011', 'Bolígrafos azules', 'Caja de 12 bolígrafos', 2, 9000, 16000, 'CAJ', 15),
    ('PRD-012', 'Archivador AZ', 'Archivador tamaño carta', 2, 22000, 35000, 'UND', 10),
    ('PRD-013', 'Grapadora mediana', 'Grapadora metálica', 2, 18000, 30000, 'UND', 8),
    ('PRD-014', 'Clips metálicos', 'Caja de 100 clips', 2, 6000, 11000, 'CAJ', 15),
    ('PRD-015', 'Marcadores permanentes', 'Caja de 6 marcadores', 2, 14000, 24000, 'CAJ', 10),
    ('PRD-016', 'Limpiador multiusos', 'Limpiador multiusos 1 litro', 3, 8500, 15000, 'UND', 15),
    ('PRD-017', 'Desinfectante', 'Desinfectante líquido 1 litro', 3, 9000, 16000, 'UND', 15),
    ('PRD-018', 'Jabón líquido', 'Jabón líquido para manos 500ml', 3, 7500, 13000, 'UND', 15),
    ('PRD-019', 'Toallas de papel', 'Paquete de toallas de papel', 3, 11000, 19000, 'PAQ', 12),
    ('PRD-020', 'Bolsas para basura', 'Rollo de bolsas negras', 3, 12500, 22000, 'ROL', 12),
    ('PRD-021', 'Café molido', 'Café molido 500g', 4, 28000, 42000, 'UND', 10),
    ('PRD-022', 'Azúcar', 'Azúcar blanca 1kg', 4, 5000, 8500, 'UND', 12),
    ('PRD-023', 'Agua embotellada', 'Paquete de 12 botellas', 4, 16000, 26000, 'PAQ', 10),
    ('PRD-024', 'Galletas surtidas', 'Paquete de galletas surtidas', 4, 10000, 17000, 'PAQ', 10),
    ('PRD-025', 'Taladro eléctrico', 'Taladro eléctrico 650W', 5, 280000, 395000, 'UND', 3),
    ('PRD-026', 'Juego de destornilladores', 'Juego de 8 destornilladores', 5, 65000, 98000, 'JGO', 5),
    ('PRD-027', 'Martillo', 'Martillo de uña 16 oz', 5, 38000, 58000, 'UND', 5),
    ('PRD-028', 'Cinta métrica', 'Cinta métrica de 5 metros', 5, 22000, 35000, 'UND', 8),
    ('PRD-029', 'Caja de tornillos', 'Caja de tornillos surtidos', 5, 18000, 30000, 'CAJ', 10),
    ('PRD-030', 'Papel fotográfico', 'Paquete de papel fotográfico', 6, 24000, 40000, 'PAQ', 10);

-- ---------------------------------------------------------
-- PROVEEDORES (8)
-- ---------------------------------------------------------
INSERT INTO proveedores (nombre, nit, email, telefono, direccion) VALUES
    ('TecnoSuministros S.A.S.', '900100101-1', 'contacto@tecnosuministros.com', '3001110001', 'Carrera 10 #20-30'),
    ('OfiMarket S.A.S.', '900100102-2', 'ventas@ofimarket.com', '3001110002', 'Calle 15 #8-20'),
    ('LimpioMax S.A.S.', '900100103-3', 'ventas@limpiomax.com', '3001110003', 'Carrera 22 #12-45'),
    ('Alimentos Central S.A.S.', '900100104-4', 'pedidos@alimentoscentral.com', '3001110004', 'Calle 30 #18-55'),
    ('FerreExpress S.A.S.', '900100105-5', 'comercial@ferreexpress.com', '3001110005', 'Carrera 7 #40-12'),
    ('Papeles Andinos S.A.S.', '900100106-6', 'ventas@papelesandinos.com', '3001110006', 'Calle 9 #25-16'),
    ('Distribuciones Norte S.A.S.', '900100107-7', 'contacto@distnorte.com', '3001110007', 'Carrera 14 #33-21'),
    ('Comercializadora Global S.A.S.', '900100108-8', 'info@comglobal.com', '3001110008', 'Calle 44 #11-09');

-- ---------------------------------------------------------
-- CLIENTES (20)
-- ---------------------------------------------------------
INSERT INTO clientes (nombre, nit, email, telefono) VALUES
    ('Distribuciones La 10 S.A.S.', '900200101-1', 'compras@la10.com', '3102000001'),
    ('Comercial El Progreso', '900200102-2', 'contacto@elprogreso.com', '3102000002'),
    ('Oficinas Modernas S.A.S.', '900200103-3', 'admin@oficinasmodernas.com', '3102000003'),
    ('Hotel Los Andes', '900200104-4', 'compras@hotellosandes.com', '3102000004'),
    ('Restaurante El Buen Sabor', '900200105-5', 'admin@elbuensabor.com', '3102000005'),
    ('Constructora Horizonte', '900200106-6', 'compras@horizonte.com', '3102000006'),
    ('Colegio San Marcos', '900200107-7', 'compras@sanmarcos.edu', '3102000007'),
    ('Clínica Central', '900200108-8', 'almacen@clinicacentral.com', '3102000008'),
    ('Papelería La Estrella', '900200109-9', 'ventas@laestrella.com', '3102000009'),
    ('Supermercado La Canasta', '900200110-0', 'compras@lacanasta.com', '3102000010'),
    ('Empresa Soluciones TI', '900200111-1', 'admin@solucionesti.com', '3102000011'),
    ('Almacenes del Valle', '900200112-2', 'compras@almacenesvalle.com', '3102000012'),
    ('Universidad Regional', '900200113-3', 'compras@uregional.edu', '3102000013'),
    ('Café Quetzal', '900200114-4', 'contacto@cafequetzal.com', '3102000014'),
    ('Taller Mecánico El Rápido', '900200115-5', 'admin@elrapido.com', '3102000015'),
    ('Ferretería Central', '900200116-6', 'compras@ferreteriacentral.com', '3102000016'),
    ('Librería Nacional', '900200117-7', 'ventas@librerianacional.com', '3102000017'),
    ('Agencia Creativa Uno', '900200118-8', 'admin@creativauno.com', '3102000018'),
    ('Servicios Empresariales GT', '900200119-9', 'compras@servemp.com', '3102000019'),
    ('Minimarket La Esquina', '900200120-0', 'contacto@minimarket.com', '3102000020');

-- ---------------------------------------------------------
-- COMPRAS (15)
-- ---------------------------------------------------------
INSERT INTO compras (numero_compra, proveedor_id, usuario_id, fecha, subtotal, impuesto, total) VALUES
    ('COM-0001', 2, 2, '2026-06-03 14:00:00', 1130000, 214700.00, 1344700.00),
    ('COM-0002', 3, 3, '2026-06-04 14:00:00', 1975000, 375250.00, 2350250.00),
    ('COM-0003', 4, 4, '2026-06-05 14:00:00', 18400000, 3496000.00, 21896000.00),
    ('COM-0004', 5, 1, '2026-06-06 14:00:00', 4675000, 888250.00, 5563250.00),
    ('COM-0005', 6, 2, '2026-06-07 14:00:00', 900000, 171000.00, 1071000.00),
    ('COM-0006', 7, 3, '2026-06-08 14:00:00', 620000, 117800.00, 737800.00),
    ('COM-0007', 8, 4, '2026-06-09 14:00:00', 600000, 114000.00, 714000.00),
    ('COM-0008', 1, 1, '2026-06-10 14:00:00', 675000, 128250.00, 803250.00),
    ('COM-0009', 2, 2, '2026-06-11 14:00:00', 427500, 81225.00, 508725.00),
    ('COM-0010', 3, 3, '2026-06-12 14:00:00', 690000, 131100.00, 821100.00),
    ('COM-0011', 4, 4, '2026-06-13 14:00:00', 685000, 130150.00, 815150.00),
    ('COM-0012', 5, 1, '2026-06-14 14:00:00', 700000, 133000.00, 833000.00),
    ('COM-0013', 6, 2, '2026-06-15 14:00:00', 9375000, 1781250.00, 11156250.00),
    ('COM-0014', 7, 3, '2026-06-16 14:00:00', 1770000, 336300.00, 2106300.00),
    ('COM-0015', 8, 4, '2026-06-17 14:00:00', 1320000, 250800.00, 1570800.00);

-- ---------------------------------------------------------
-- DETALLE DE COMPRAS
-- ---------------------------------------------------------
INSERT INTO detalle_compras (compra_id, producto_id, cantidad, precio_unitario, subtotal) VALUES
    (1, 1, 20, 25000, 500000),
    (1, 2, 15, 42000, 630000),
    (2, 3, 25, 55000, 1375000),
    (2, 4, 20, 30000, 600000),
    (3, 5, 30, 180000, 5400000),
    (3, 6, 25, 520000, 13000000),
    (4, 7, 35, 95000, 3325000),
    (4, 8, 30, 45000, 1350000),
    (5, 9, 40, 18000, 720000),
    (5, 10, 15, 12000, 180000),
    (6, 11, 20, 9000, 180000),
    (6, 12, 20, 22000, 440000),
    (7, 13, 25, 18000, 450000),
    (7, 14, 25, 6000, 150000),
    (8, 15, 30, 14000, 420000),
    (8, 16, 30, 8500, 255000),
    (9, 17, 35, 9000, 315000),
    (9, 18, 15, 7500, 112500),
    (10, 19, 40, 11000, 440000),
    (10, 20, 20, 12500, 250000),
    (11, 21, 20, 28000, 560000),
    (11, 22, 25, 5000, 125000),
    (12, 23, 25, 16000, 400000),
    (12, 24, 30, 10000, 300000),
    (13, 25, 30, 280000, 8400000),
    (13, 26, 15, 65000, 975000),
    (14, 27, 35, 38000, 1330000),
    (14, 28, 20, 22000, 440000),
    (15, 29, 40, 18000, 720000),
    (15, 30, 25, 24000, 600000);

-- ---------------------------------------------------------
-- VENTAS (25)
-- ---------------------------------------------------------
INSERT INTO ventas (numero_venta, cliente_id, usuario_id, fecha, subtotal, impuesto, total) VALUES
    ('VEN-0001', 2, 2, '2026-06-21 09:00:00', 810000, 153900.00, 963900.00),
    ('VEN-0002', 3, 1, '2026-06-21 12:00:00', 435000, 82650.00, 517650.00),
    ('VEN-0003', 4, 2, '2026-06-22 09:00:00', 1120000, 212800.00, 1332800.00),
    ('VEN-0004', 5, 1, '2026-06-22 12:00:00', 760000, 144400.00, 904400.00),
    ('VEN-0005', 6, 2, '2026-06-23 09:00:00', 78000, 14820.00, 92820.00),
    ('VEN-0006', 7, 1, '2026-06-23 12:00:00', 93000, 17670.00, 110670.00),
    ('VEN-0007', 8, 2, '2026-06-24 09:00:00', 133000, 25270.00, 158270.00),
    ('VEN-0008', 9, 1, '2026-06-24 12:00:00', 164000, 31160.00, 195160.00),
    ('VEN-0009', 10, 2, '2026-06-25 09:00:00', 57500, 10925.00, 68425.00),
    ('VEN-0010', 11, 1, '2026-06-25 12:00:00', 74000, 14060.00, 88060.00),
    ('VEN-0011', 12, 2, '2026-06-26 09:00:00', 364000, 69160.00, 433160.00),
    ('VEN-0012', 13, 1, '2026-06-26 12:00:00', 235000, 44650.00, 279650.00),
    ('VEN-0013', 14, 2, '2026-06-27 09:00:00', 830000, 157700.00, 987700.00),
    ('VEN-0014', 15, 1, '2026-06-27 12:00:00', 324000, 61560.00, 385560.00),
    ('VEN-0015', 16, 2, '2026-06-28 09:00:00', 276000, 52440.00, 328440.00),
    ('VEN-0016', 17, 1, '2026-06-28 12:00:00', 945000, 179550.00, 1124550.00),
    ('VEN-0017', 18, 2, '2026-06-29 09:00:00', 340000, 64600.00, 404600.00),
    ('VEN-0018', 19, 1, '2026-06-29 12:00:00', 855000, 162450.00, 1017450.00),
    ('VEN-0019', 20, 2, '2026-06-30 09:00:00', 615000, 116850.00, 731850.00),
    ('VEN-0020', 1, 1, '2026-06-30 12:00:00', 162000, 30780.00, 192780.00),
    ('VEN-0021', 2, 2, '2026-07-01 09:00:00', 77000, 14630.00, 91630.00),
    ('VEN-0022', 3, 1, '2026-07-01 12:00:00', 103000, 19570.00, 122570.00),
    ('VEN-0023', 4, 2, '2026-07-02 09:00:00', 140000, 26600.00, 166600.00),
    ('VEN-0024', 5, 1, '2026-07-02 12:00:00', 105500, 20045.00, 125545.00),
    ('VEN-0025', 6, 2, '2026-07-03 09:00:00', 55000, 10450.00, 65450.00);

-- ---------------------------------------------------------
-- DETALLE DE VENTAS
-- ---------------------------------------------------------
INSERT INTO detalle_ventas (venta_id, producto_id, cantidad, precio_unitario, subtotal) VALUES
    (1, 1, 2, 45000, 90000),
    (1, 6, 1, 720000, 720000),
    (2, 3, 3, 95000, 285000),
    (2, 8, 2, 75000, 150000),
    (3, 5, 4, 265000, 1060000),
    (3, 10, 3, 20000, 60000),
    (4, 7, 5, 145000, 725000),
    (4, 12, 1, 35000, 35000),
    (5, 9, 2, 28000, 56000),
    (5, 14, 2, 11000, 22000),
    (6, 11, 3, 16000, 48000),
    (6, 16, 3, 15000, 45000),
    (7, 13, 4, 30000, 120000),
    (7, 18, 1, 13000, 13000),
    (8, 15, 5, 24000, 120000),
    (8, 20, 2, 22000, 44000),
    (9, 17, 2, 16000, 32000),
    (9, 22, 3, 8500, 25500),
    (10, 19, 3, 19000, 57000),
    (10, 24, 1, 17000, 17000),
    (11, 21, 4, 42000, 168000),
    (11, 26, 2, 98000, 196000),
    (12, 23, 5, 26000, 130000),
    (12, 28, 3, 35000, 105000),
    (13, 25, 2, 395000, 790000),
    (13, 30, 1, 40000, 40000),
    (14, 27, 3, 58000, 174000),
    (14, 2, 2, 75000, 150000),
    (15, 29, 4, 30000, 120000),
    (15, 4, 3, 52000, 156000),
    (16, 1, 5, 45000, 225000),
    (16, 6, 1, 720000, 720000),
    (17, 3, 2, 95000, 190000),
    (17, 8, 2, 75000, 150000),
    (18, 5, 3, 265000, 795000),
    (18, 10, 3, 20000, 60000),
    (19, 7, 4, 145000, 580000),
    (19, 12, 1, 35000, 35000),
    (20, 9, 5, 28000, 140000),
    (20, 14, 2, 11000, 22000),
    (21, 11, 2, 16000, 32000),
    (21, 16, 3, 15000, 45000),
    (22, 13, 3, 30000, 90000),
    (22, 18, 1, 13000, 13000),
    (23, 15, 4, 24000, 96000),
    (23, 20, 2, 22000, 44000),
    (24, 17, 5, 16000, 80000),
    (24, 22, 3, 8500, 25500),
    (25, 19, 2, 19000, 38000),
    (25, 24, 1, 17000, 17000);

-- ---------------------------------------------------------
-- MOVIMIENTOS DE INVENTARIO (SOLO ENTRADAS)
-- ---------------------------------------------------------
INSERT INTO movimientos_inventario (producto_id, tipo_movimiento, cantidad, saldo_disponible, costo_unitario, stock_anterior, stock_nuevo, referencia_tipo, referencia_id, usuario_id, fecha) VALUES
    (1, 'ENTRADA', 20, 20, 25000, 0, 20, 'COMPRA', 1, 2, '2026-06-03 14:00:00'),
    (2, 'ENTRADA', 15, 15, 42000, 0, 15, 'COMPRA', 1, 2, '2026-06-03 14:00:00'),
    (3, 'ENTRADA', 25, 25, 55000, 0, 25, 'COMPRA', 2, 3, '2026-06-04 14:00:00'),
    (4, 'ENTRADA', 20, 20, 30000, 0, 20, 'COMPRA', 2, 3, '2026-06-04 14:00:00'),
    (5, 'ENTRADA', 30, 30, 180000, 0, 30, 'COMPRA', 3, 4, '2026-06-05 14:00:00'),
    (6, 'ENTRADA', 25, 25, 520000, 0, 25, 'COMPRA', 3, 4, '2026-06-05 14:00:00'),
    (7, 'ENTRADA', 35, 35, 95000, 0, 35, 'COMPRA', 4, 1, '2026-06-06 14:00:00'),
    (8, 'ENTRADA', 30, 30, 45000, 0, 30, 'COMPRA', 4, 1, '2026-06-06 14:00:00'),
    (9, 'ENTRADA', 40, 40, 18000, 0, 40, 'COMPRA', 5, 2, '2026-06-07 14:00:00'),
    (10, 'ENTRADA', 15, 15, 12000, 0, 15, 'COMPRA', 5, 2, '2026-06-07 14:00:00'),
    (11, 'ENTRADA', 20, 20, 9000, 0, 20, 'COMPRA', 6, 3, '2026-06-08 14:00:00'),
    (12, 'ENTRADA', 20, 20, 22000, 0, 20, 'COMPRA', 6, 3, '2026-06-08 14:00:00'),
    (13, 'ENTRADA', 25, 25, 18000, 0, 25, 'COMPRA', 7, 4, '2026-06-09 14:00:00'),
    (14, 'ENTRADA', 25, 25, 6000, 0, 25, 'COMPRA', 7, 4, '2026-06-09 14:00:00'),
    (15, 'ENTRADA', 30, 30, 14000, 0, 30, 'COMPRA', 8, 1, '2026-06-10 14:00:00'),
    (16, 'ENTRADA', 30, 30, 8500, 0, 30, 'COMPRA', 8, 1, '2026-06-10 14:00:00'),
    (17, 'ENTRADA', 35, 35, 9000, 0, 35, 'COMPRA', 9, 2, '2026-06-11 14:00:00'),
    (18, 'ENTRADA', 15, 15, 7500, 0, 15, 'COMPRA', 9, 2, '2026-06-11 14:00:00'),
    (19, 'ENTRADA', 40, 40, 11000, 0, 40, 'COMPRA', 10, 3, '2026-06-12 14:00:00'),
    (20, 'ENTRADA', 20, 20, 12500, 0, 20, 'COMPRA', 10, 3, '2026-06-12 14:00:00'),
    (21, 'ENTRADA', 20, 20, 28000, 0, 20, 'COMPRA', 11, 4, '2026-06-13 14:00:00'),
    (22, 'ENTRADA', 25, 25, 5000, 0, 25, 'COMPRA', 11, 4, '2026-06-13 14:00:00'),
    (23, 'ENTRADA', 25, 25, 16000, 0, 25, 'COMPRA', 12, 1, '2026-06-14 14:00:00'),
    (24, 'ENTRADA', 30, 30, 10000, 0, 30, 'COMPRA', 12, 1, '2026-06-14 14:00:00'),
    (25, 'ENTRADA', 30, 30, 280000, 0, 30, 'COMPRA', 13, 2, '2026-06-15 14:00:00'),
    (26, 'ENTRADA', 15, 15, 65000, 0, 15, 'COMPRA', 13, 2, '2026-06-15 14:00:00'),
    (27, 'ENTRADA', 35, 35, 38000, 0, 35, 'COMPRA', 14, 3, '2026-06-16 14:00:00'),
    (28, 'ENTRADA', 20, 20, 22000, 0, 20, 'COMPRA', 14, 3, '2026-06-16 14:00:00'),
    (29, 'ENTRADA', 40, 40, 18000, 0, 40, 'COMPRA', 15, 4, '2026-06-17 14:00:00'),
    (30, 'ENTRADA', 25, 25, 24000, 0, 25, 'COMPRA', 15, 4, '2026-06-17 14:00:00');

-- ---------------------------------------------------------
-- ACTUALIZACIÓN DEL STOCK_ACTUAL EN PRODUCTOS
-- Stock final = entradas por compras - salidas por ventas.
-- ---------------------------------------------------------
UPDATE productos SET stock_actual = 13 WHERE id = 1;
UPDATE productos SET stock_actual = 13 WHERE id = 2;
UPDATE productos SET stock_actual = 20 WHERE id = 3;
UPDATE productos SET stock_actual = 17 WHERE id = 4;
UPDATE productos SET stock_actual = 23 WHERE id = 5;
UPDATE productos SET stock_actual = 23 WHERE id = 6;
UPDATE productos SET stock_actual = 26 WHERE id = 7;
UPDATE productos SET stock_actual = 26 WHERE id = 8;
UPDATE productos SET stock_actual = 33 WHERE id = 9;
UPDATE productos SET stock_actual = 9 WHERE id = 10;
UPDATE productos SET stock_actual = 15 WHERE id = 11;
UPDATE productos SET stock_actual = 18 WHERE id = 12;
UPDATE productos SET stock_actual = 18 WHERE id = 13;
UPDATE productos SET stock_actual = 21 WHERE id = 14;
UPDATE productos SET stock_actual = 21 WHERE id = 15;
UPDATE productos SET stock_actual = 24 WHERE id = 16;
UPDATE productos SET stock_actual = 28 WHERE id = 17;
UPDATE productos SET stock_actual = 13 WHERE id = 18;
UPDATE productos SET stock_actual = 35 WHERE id = 19;
UPDATE productos SET stock_actual = 16 WHERE id = 20;
UPDATE productos SET stock_actual = 16 WHERE id = 21;
UPDATE productos SET stock_actual = 19 WHERE id = 22;
UPDATE productos SET stock_actual = 20 WHERE id = 23;
UPDATE productos SET stock_actual = 28 WHERE id = 24;
UPDATE productos SET stock_actual = 28 WHERE id = 25;
UPDATE productos SET stock_actual = 13 WHERE id = 26;
UPDATE productos SET stock_actual = 32 WHERE id = 27;
UPDATE productos SET stock_actual = 17 WHERE id = 28;
UPDATE productos SET stock_actual = 36 WHERE id = 29;
UPDATE productos SET stock_actual = 24 WHERE id = 30;

