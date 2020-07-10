'use strict'

var express = require('express');
var productController = require('../controllers/product.controller');
var mdAuath = require('../middlewares/authenticated');

var api = express.Router();

api.put('/saveProduct/:idC', mdAuath.authenticated, productController.saveProduct);
api.put('/saveProductBranchOffice/:idC/:idB', mdAuath.authenticated, productController.setProductBranchOffice);
api.put('/updateProduct/:idC/:idP', mdAuath.authenticated, productController.updateProduct);
api.put('/removeProduct/:idC/:idP', mdAuath.authenticated, productController.removeProduct);
api.get('/listProductsOfBranch/:idC/:idB', mdAuath.authenticated, productController.listProductsOfBranch);
api.get('/listProducts/:idC', mdAuath.authenticated , productController.listProducts);
api.get('/controlStockCompany/:idC/:idP', mdAuath.authenticated , productController.controlOfStockCompanies);
api.get('/controlStockBranchOffice/:idC/:idB/:idP', mdAuath.authenticated , productController.controlOfStockBranchOffice);
api.post('/searchProduct/:idC/:idB', mdAuath.authenticated, productController.searchProduct);
api.get('/createPDF/:idC/:idB', mdAuath.authenticated, productController.createPDF);
module.exports = api;