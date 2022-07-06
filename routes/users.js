const express = require("express");
const pool  = require('../database/database.js');
const router = express.Router();

// create user
/**
 * @swagger
 * components:
 *  schemas:
 *      Cliente:
 *          type: object
 *          properties:
 *              nombre:
 *                  type: string
 *                  description: nombre de cliente
 *              apellido:
 *                  type: string
 *                  description: apellido de cliente
 *              edad:
 *                  type: integer
 *                  description: edad de cliente
 *              fecha_nacimiento:
 *                  type: date
 *                  description: fecha de nacimiento de cliente
 *              created_at:
 *                  type: timestamp
 *                  description: fecha de creacion de cliente
 *              updated_at:
 *                  type: timestamp
 *                  description: fecha de modificacion de cliente
 *              deleted_at:
 *                  type: timestamp
 *                  description: fecha de eliminacion de cliente
 *          required:
 *              - nombre
 *              - apellido
 *              - edad
 *              - fecha_nacimiento
 *          example:
 *              nombre: test
 *              apellido: test
 *              edad: 20
 *              fecha_nacimiento: "2020-02-02"
 */

/**
 * @swagger
 * /creacliente:
 *  post:
 *      summary: crear nuevo cliente
 *      tags: [Cliente]
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      $ref: '#/components/schemas/Cliente'
 *      responses:
 *          200:
 *              description: ¡Cliente guardado!
 *          500:
 *              description: Error
 */
router.post("/creacliente", (req, res) => {
    const {id, nombre, apellido, edad, fecha_nacimiento} = req.body;
    console.log(id, nombre, apellido, edad, fecha_nacimiento);

    if(dateIsValid(fecha_nacimiento)) {
        if(true_age(fecha_nacimiento, edad)){
            const query = 'INSERT INTO clientes (id, nombre, apellido, edad, fecha_nacimiento, created_at, updated_at, deleted_at) VALUES (?,?,?,?,?,now(),now(),null);'
            pool.query(query, [id, nombre, apellido, edad, fecha_nacimiento], (err, rows, fields) => {
                if(!err) {
                    res.json('¡Cliente guardado!');
                } else {
                    res.status(500).json(err);
                }
            });
        }else{
            res.status(500).json('Tu edad no concuerda con tu fecha de nacimiento.');
        }
    }else
        res.status(500).json('Formato de fecha de nacimiento equivocado, formato esperado (aaaa-mm-dd).');
});

function true_age(fecha_nacimiento, edad){
    var hoy = new Date();
    var f_nacimiento = new Date(fecha_nacimiento);
    var mi_edad = hoy.getFullYear() - f_nacimiento.getFullYear();
    var m = hoy.getMonth() - f_nacimiento.getMonth();

    if (m < 0 || (m === 0 && hoy.getDate() < f_nacimiento.getDate())) {
        mi_edad--;
    }
    console.log({mi_edad, edad});
    return mi_edad == edad;
}

function dateIsValid(dateStr) {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
  
    if (dateStr.match(regex) === null) {
      return false;
    }
  
    const date = new Date(dateStr);
  
    const timestamp = date.getTime();
  
    if (typeof timestamp !== 'number' || Number.isNaN(timestamp)) {
      return false;
    }
    return true;
    // return date.toISOString().startsWith(dateStr);
  }

// get all users
/**
 * @swagger
 * /listclientes:
 *  get:
 *      summary: listar clientes
 *      tags: [Cliente]
 *      responses:
 *          200:
 *              description: Todos los clientes
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: array
 *                          items:
 *                              $ref: '#/components/schemas/Cliente'
 *          500:
 *              description: Error
 */
router.get("/listclientes", (req, res) => {
    const prob_muerte = 90; //segun estadisticas
    pool.query('SELECT * FROM clientes', (err, rows, fields) => {
        if(!err) {
            rows.forEach(row => {
                var f_muerte = new Date(row.fecha_nacimiento);
                f_muerte.setFullYear(f_muerte.getFullYear() + (prob_muerte - row.edad));
                row['fecha_muerte'] = f_muerte;
            });
            res.json(rows);
        } else {
            res.status(500).json(err);
        }
    });
});

// get all users
/**
 * @swagger
 * /kpideclientes:
 *  get:
 *      summary: KPI's de clientes
 *      tags: [Cliente]
 *      responses:
 *          200:
 *              description: Todos los clientes
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              promedio_edad:
 *                                  type: integer
 *                                  description: Promedio edad entre todos los clientes
 *                              desviacion_estandar:
 *                                  type: integer
 *                                  description: Desviación estándar entre las edades de todos los clientes
 *          500:
 *              description: Error
 */
router.get("/kpideclientes", (req, res) => {
    pool.query('SELECT * FROM clientes where deleted_at is null', (err, rows, fields) => {
        if(!err) {
            var edades = [];
            var total = 0;
            rows.forEach(element => {
                edades.push(element.edad);
                total += element.edad;
            });
            promedio = total / edades.length;
            var desviacion_estandar = calc_desviacion_estandar(edades);
            res.json({promedio,desviacion_estandar});
        } else {
            res.status(500).json(err);
        }
    });
});

function calc_desviacion_estandar(edades){
    // Creating the mean with Array.reduce
    let mean = edades.reduce((acc, curr)=>{
        return acc + curr
    }, 0) / edades.length;
    
    // Assigning (value - mean) ^ 2 to every array item
    edades = edades.map((k)=>{
        return (k - mean) ** 2
    })
    
    // Calculating the sum of updated array
    let sum = edades.reduce((acc, curr)=> acc + curr, 0);
    
    // Calculating the variance
    let variance = sum / edades.length
    
    // Returning the Standered deviation
    return Math.sqrt(sum / edades.length)
}

module.exports = router;
