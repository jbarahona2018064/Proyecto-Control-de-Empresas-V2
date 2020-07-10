'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var branchOfficeSchema = Schema ({
        location: String,
        phone: String,
        supervisor: String,
        email: String,
        productsStock: [{
                nameProduct: String,
                quantity: Number,
                unitPrice: String
        }]
});

module.exports = mongoose.model('branchOffice', branchOfficeSchema);