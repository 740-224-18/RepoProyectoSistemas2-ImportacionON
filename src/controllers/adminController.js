const bcrypt = require('bcrypt');
const mysql = require('mysql2');

// Obtener todos los productos
function listProducts(req, res) {
    req.getConnection((err, conn) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error de conexión');
        }
        conn.query('SELECT * FROM productos', (err, rows) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error al obtener productos');
            }
            res.render('admin/products', { productos: rows });
        });
    });
}

// Mostrar formulario para agregar producto
function addProductForm(req, res) {
    res.render('admin/products/form', { action: 'Agregar' });
}

// Agregar un nuevo producto
function addProduct(req, res) {
    const { nombre, descripcion, precio, imagen } = req.body;
    req.getConnection((err, conn) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error de conexión');
        }
        const newProduct = { nombre, descripcion, precio, imagen };
        conn.query('INSERT INTO productos SET ?', newProduct, (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error al agregar producto');
            }
            res.redirect('/admin/products');
        });
    });
}

// Mostrar formulario para editar producto
function editProductForm(req, res) {
    const productId = req.params.id;
    req.getConnection((err, conn) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error de conexión');
        }
        conn.query('SELECT * FROM productos WHERE id = ?', [productId], (err, rows) => {
            if (err || rows.length === 0) {
                console.error(err);
                return res.status(404).send('Producto no encontrado');
            }
            res.render('admin/products/form', { action: 'Editar', producto: rows[0] });
        });
    });
}

// Actualizar producto
function updateProduct(req, res) {
    const productId = req.params.id;
    const { nombre, descripcion, precio, imagen } = req.body;
    req.getConnection((err, conn) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error de conexión');
        }
        const updatedProduct = { nombre, descripcion, precio, imagen };
        conn.query('UPDATE productos SET ? WHERE id = ?', [updatedProduct, productId], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error al actualizar producto');
            }
            res.redirect('/admin/products');
        });
    });
}

// Eliminar producto
function deleteProduct(req, res) {
    const productId = req.params.id;
    req.getConnection((err, conn) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error de conexión');
        }
        conn.query('DELETE FROM productos WHERE id = ?', [productId], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error al eliminar producto');
            }
            res.redirect('/admin/products');
        });
    });
}

// Obtener todos los empleados
function listEmployees(req, res) {
    req.getConnection((err, conn) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error de conexión');
        }
        conn.query('SELECT * FROM empleados', (err, rows) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error al obtener empleados');
            }
            res.render('admin/employees', { empleados: rows });
        });
    });
}

// Mostrar formulario para agregar empleado
function addEmployeeForm(req, res) {
    res.render('admin/employees/form', { action: 'Agregar' });
}

// Agregar un nuevo empleado
function addEmployee(req, res) {
    const { nombre, apellido, email, puesto } = req.body;
    req.getConnection((err, conn) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error de conexión');
        }
        const newEmployee = { nombre, apellido, email, puesto };
        conn.query('INSERT INTO empleados SET ?', newEmployee, (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error al agregar empleado');
            }
            res.redirect('/admin/employees');
        });
    });
}

// Mostrar formulario para editar empleado
function editEmployeeForm(req, res) {
    const employeeId = req.params.id;
    req.getConnection((err, conn) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error de conexión');
        }
        conn.query('SELECT * FROM empleados WHERE id = ?', [employeeId], (err, rows) => {
            if (err || rows.length === 0) {
                console.error(err);
                return res.status(404).send('Empleado no encontrado');
            }
            res.render('admin/employees/form', { action: 'Editar', empleado: rows[0] });
        });
    });
}

// Actualizar empleado
function updateEmployee(req, res) {
    const employeeId = req.params.id;
    const { nombre, apellido, email, puesto } = req.body;
    req.getConnection((err, conn) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error de conexión');
        }
        const updatedEmployee = { nombre, apellido, email, puesto };
        conn.query('UPDATE empleados SET ? WHERE id = ?', [updatedEmployee, employeeId], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error al actualizar empleado');
            }
            res.redirect('/admin/employees');
        });
    });
}

// Eliminar empleado
function deleteEmployee(req, res) {
    const employeeId = req.params.id;
    req.getConnection((err, conn) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error de conexión');
        }
        conn.query('DELETE FROM empleados WHERE id = ?', [employeeId], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error al eliminar empleado');
            }
            res.redirect('/admin/employees');
        });
    });
}

module.exports = {
    listProducts,
    addProductForm,
    addProduct,
    editProductForm,
    updateProduct,
    deleteProduct,
    listEmployees,
    addEmployeeForm,
    addEmployee,
    editEmployeeForm,
    updateEmployee,
    deleteEmployee
};
