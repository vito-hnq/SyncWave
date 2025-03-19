// backend/app.js
const express = require('express');
const routes = require('./routes'); 

const app = express();

// Middlewares
app.use(express.json());

// Rotas
app.use('/api', routes); 

module.exports = app;