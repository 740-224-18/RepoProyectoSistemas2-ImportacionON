CREATE DATABASE importadoraon;
drop database importadoraon;
USE importadoraon;
-- Active: 1742483176453@@127.0.0.1@3306@importadora
CREATE TABLE EMPRESA (
    cod_empresa INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    nit VARCHAR(30),
    telefono VARCHAR(30),
    direccion TEXT,
    email VARCHAR(100)
);

-- TABLA PROVEEDOR
CREATE TABLE PROVEEDOR (
    cod_proveedor INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    telefono VARCHAR(30),
    direccion TEXT,
    empresa_id INT,
    FOREIGN KEY (empresa_id) REFERENCES EMPRESA(cod_empresa)
);

-- TABLA CARGO
CREATE TABLE CARGO (
    cod_cargo INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(50) NOT NULL,
    salario DECIMAL(10,2)
);

-- TABLA EMPLEADO
CREATE TABLE EMPLEADO (
    cod_empleado INT PRIMARY KEY AUTO_INCREMENT,
    nombres VARCHAR(100),
    apellidos VARCHAR(100),
    ci VARCHAR(20) UNIQUE,
    celular VARCHAR(30),
    direccion TEXT,
    fecha_contratacion DATE,
    email VARCHAR(100) UNIQUE,
    foto VARCHAR(255),
    cod_cargo INT,
    FOREIGN KEY (cod_cargo) REFERENCES CARGO(cod_cargo)
);

-- TABLA ADMINISTRADOR (empleado con rol admin)
CREATE TABLE ADMINISTRADOR (
    cod_admin INT PRIMARY KEY AUTO_INCREMENT,
    empleado_id INT UNIQUE,
    FOREIGN KEY (empleado_id) REFERENCES EMPLEADO(cod_empleado)
);

-- TABLA CLIENTE
CREATE TABLE CLIENTE (
    cod_cliente INT PRIMARY KEY AUTO_INCREMENT,
    nombres VARCHAR(100),
    apellidos VARCHAR(100),
    ci_o_nit VARCHAR(30) UNIQUE,
    celular VARCHAR(30),
    direccion TEXT,
    email VARCHAR(100),
    descuento_id INT,
    FOREIGN KEY (descuento_id) REFERENCES DESCUENTO(cod_descuento)
);

-- TABLA REGISTRO (LOGIN INFO)
CREATE TABLE REGISTRO (
    cod_registro INT PRIMARY KEY AUTO_INCREMENT,
    usuario VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    cliente_id INT UNIQUE,
    FOREIGN KEY (cliente_id) REFERENCES CLIENTE(cod_cliente)
);

-- TABLA DESCUENTO
CREATE TABLE DESCUENTO (
    cod_descuento INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100),
    porcentaje DECIMAL(5,2),
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE
);

-- TABLA CATEGORIA
CREATE TABLE CATEGORIA (
    cod_cat INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100),
    descripcion TEXT
);

-- TABLA PRODUCTO
CREATE TABLE PRODUCTO (
    cod_producto INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100),
    descripcion TEXT,
    precio DECIMAL(10,2),
    stock INT,
    foto TEXT,
    cod_cat INT,
    FOREIGN KEY (cod_cat) REFERENCES CATEGORIA(cod_cat)
);

-- TABLA METODO DE PAGO
CREATE TABLE METODO_PAGO (
    cod_metodo INT PRIMARY KEY AUTO_INCREMENT,
    nom_metodo VARCHAR(100)
);

-- TABLA ESTADO
CREATE TABLE ESTADO (
    cod_estado INT PRIMARY KEY AUTO_INCREMENT,
    nom_estado VARCHAR(50)
);

-- TABLA PEDIDO
CREATE TABLE PEDIDO (
    cod_pedido INT PRIMARY KEY AUTO_INCREMENT,
    cliente_id INT,
    fecha_ped DATETIME,
    total DECIMAL(10,2),
    estado_id INT,
    metodo_pago_id INT,
    FOREIGN KEY (cliente_id) REFERENCES CLIENTE(cod_cliente),
    FOREIGN KEY (estado_id) REFERENCES ESTADO(cod_estado),
    FOREIGN KEY (metodo_pago_id) REFERENCES METODO_PAGO(cod_metodo)
);

-- TABLA DETALLE_PEDIDOS
CREATE TABLE DETALLE_PEDIDOS (
    cod_detalle INT PRIMARY KEY AUTO_INCREMENT,
    pedido_id INT,
    producto_id INT,
    cantidad INT,
    precio_unit DECIMAL(10,2),
    subtotal DECIMAL(10,2),
    FOREIGN KEY (pedido_id) REFERENCES PEDIDO(cod_pedido),
    FOREIGN KEY (producto_id) REFERENCES PRODUCTO(cod_producto)
);

-- TABLA RECIBO
CREATE TABLE RECIBO (
    cod_recibo INT PRIMARY KEY AUTO_INCREMENT,
    pedido_id INT UNIQUE,
    fecha_emision DATETIME,
    monto_total DECIMAL(10,2),
    detalle_extra TEXT,
    FOREIGN KEY (pedido_id) REFERENCES PEDIDO(cod_pedido)
);

-- TABLA HISTORIAL INVENTARIO
CREATE TABLE TIPO_MOVIMIENTO (
    cod_tipo_mov INT PRIMARY KEY AUTO_INCREMENT,
    tipo_mov VARCHAR(50)
);

CREATE TABLE HISTORIAL_INVENTARIO (
    cod_historial INT PRIMARY KEY AUTO_INCREMENT,
    producto_id INT,
    tipo_mov_id INT,
    fecha_mov DATETIME,
    cantidad INT,
    stock_anterior INT,
    stock_nuevo INT,
    referencia VARCHAR(100),
    observaciones TEXT,
    FOREIGN KEY (producto_id) REFERENCES PRODUCTO(cod_producto),
    FOREIGN KEY (tipo_mov_id) REFERENCES TIPO_MOVIMIENTO(cod_tipo_mov)
);

-- TABLA COMPRA
CREATE TABLE COMPRA (
    cod_compra INT PRIMARY KEY AUTO_INCREMENT,
    fecha_compra DATETIME,
    empleado_id INT,
    proveedor_id INT,
    monto_total DECIMAL(10,2),
    observaciones TEXT,
    FOREIGN KEY (empleado_id) REFERENCES EMPLEADO(cod_empleado),
    FOREIGN KEY (proveedor_id) REFERENCES PROVEEDOR(cod_proveedor)
);

-- TABLA DETALLE_COMPRA
CREATE TABLE DETALLE_COMPRA (
    cod_detalle INT PRIMARY KEY AUTO_INCREMENT,
    cod_compra INT,
    producto_id INT,
    cantidad INT,
    precio_unit DECIMAL(10,2),
    subtotal DECIMAL(10,2),
    FOREIGN KEY (cod_compra) REFERENCES COMPRA(cod_compra),
    FOREIGN KEY (producto_id) REFERENCES PRODUCTO(cod_producto)
);

-- TABLA REPORTE_SEMANAL
CREATE TABLE REPORTE_SEMANAL (
    cod_reporte INT PRIMARY KEY AUTO_INCREMENT,
    fecha_inicio DATE,
    fecha_fin DATE,
    total_pedidos INT,
    monto_total DECIMAL(10,2),
    fecha_generado DATETIME,
    generado_por INT NULL
);