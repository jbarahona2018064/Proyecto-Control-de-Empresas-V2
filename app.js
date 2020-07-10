'use strict'

var express = require('express');
var bodyParser = require('body-parser');
var companyRoute = require('./routes/company.route');
var employeeRoute = require('./routes/employee.route');
var branchOfficeRoute = require('./routes/branchOffice.route');
var productRoute = require('./routes/product.route');

var app = express();

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

// Configuración de CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});

app.use(companyRoute);
app.use(employeeRoute);
app.use(branchOfficeRoute);
app.use(productRoute);

module.exports = app;