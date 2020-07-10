'use strict'

var express = require('express');
var employeeController = require('../controllers/employee.controller');

var api = express.Router();

api.put('/:idC/saveEmployee', employeeController.saveEmployee);
api.put('/:idC/updateEmployee/:idE', employeeController.updateEmployee);
api.put('/:idC/deleteEmployee/:idE', employeeController.removeEmployee);
api.post('/:idC/searchEmployeeId', employeeController.searchEmploye);
api.post('/:idC/searchEmployeeName', employeeController.searchEmployeName);
api.post('/:idC/searchEmployeeJob', employeeController.searchEmployeJob);
api.post('/:idC/searchEmployeeDepartament', employeeController.searchEmployeDepartament);
api.get('/:idC/listEmployees', employeeController.listEmployes);
api.get('/:idC/dataExcel', employeeController.dataExcel);
module.exports = api;