'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var companySchema = Schema({
    name: String,
    ceo: String,
    businessName: String,
    NIT: String,
    activity: String,
    location: String,
    email: String,
    phone: String,
    user: String,
    password: String,
    employees: [{
        name: String,
        DPI: String, 
        address: String, 
        phone: String, 
        email: String, 
        password: String,
        NIT: String,
        job: String,
        departament: String,
    }],
    branchOffices: [{ 
        location: String,
        phone: String,
        supervisor: String,
        email: String,
        productsStock: [{
            nameProduct: String,
            quantity: Number,
            unitPrice: String
        }]
    }],
    productsStock: [{
        nameProduct: String,
        quantity: Number,
        unitPrice: String
    }]
});

module.exports = mongoose.model('company',companySchema);