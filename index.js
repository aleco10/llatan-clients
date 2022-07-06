const express = require('express');
const userRoute = require("./routes/users");
const path = require('path');

//swagger
const swaggerUI = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerSpec = {
    definition:{
        openapi: "3.0.0",
        info: {
            title: "Clientes de Llatan",
            description: "adminisracion de usuarios",
            version: "1.0.1"
        },
        servers: [
            {
                url: "https://llatan-clients.herokuapp.com"
            }
        ]
    },
    apis: [ `${path.join(__dirname,"./routes/*.js")}`]
};

//settings
const app = express();
app.set('port', process.env.PORT || 3000);
// const port = process.env.PORT || 9000;

//middleware
app.use(express.json());
app.use("/api-doc", swaggerUI.serve, swaggerUI.setup(swaggerJsDoc(swaggerSpec)));

// routes
app.use("/", userRoute);
app.get("/", (req, res) => {
    res.send("Bienvenido a Llatan");
});

app.listen(app.get('port'),() => { console.log("Server on port: ", app.get('port')); });