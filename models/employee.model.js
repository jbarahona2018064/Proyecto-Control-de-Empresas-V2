'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var employeeSchema = Schema({
    name: String, // importante
    DPI: String, // importante
    address: String, 
    phone: String, 
    email: String, // importante
    password: String, //Importante
    NIT: String,// importante
    job: String,// importante
    departament: String, // importante
});

module.exports = mongoose.model('employee', employeeSchema);