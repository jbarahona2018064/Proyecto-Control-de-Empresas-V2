'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var compProductSchema = Schema({
    nameProduct: String,
    quantity: Number,
    unitPrice: String
});

module.exports = mongoose.model('product', compProductSchema);