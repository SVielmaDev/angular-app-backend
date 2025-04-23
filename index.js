const express = require('express');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');
const OpenApiValidator = require("express-openapi-validator");
const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path'); // ✅ Faltaba esto

// Cargar variables de entorno
dotenv.config();

const app = express();
app.use(express.json());

// Cargar Swagger
const swaggerDocument = yaml.load(fs.readFileSync('./api/openapi.yml', 'utf8'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Validar y enlazar controladores
app.use(
  OpenApiValidator.middleware({
    apiSpec: './api/openapi.yml',
    validateRequests: true,
    validateResponses: true,
    operationHandlers: path.join(__dirname, 'controllers'),
  })
);

app.use('/imagenes', express.static(path.join(__dirname, 'public/imagenes')));
// Puerto del servidor
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
