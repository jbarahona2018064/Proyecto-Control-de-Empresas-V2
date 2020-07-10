'use strict'

var express = require('express');
var companyController = require('../controllers/company.controller');
var mdAuth = require('../middlewares/authenticated');

var api = express.Router();

api.post('/login', companyController.loginCompany);
api.post('/saveCompany', companyController.saveCompany);
api.put('/updateCompany/:idC', mdAuth.authenticated, companyController.updateCompany);
api.delete('/deleteCompany/:idC', mdAuth.authenticated, companyController.deleteCompany);
api.get('/listCompanies', companyController.listCompanies);
api.get('/quantityEmployees/:idC', mdAuth.authenticated , companyController.quantityEmployees);

api.get('/dataExcel', companyController.dataExcel);

module.exports = api;