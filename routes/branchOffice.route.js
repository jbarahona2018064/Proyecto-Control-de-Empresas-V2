'use strict'

var express = require('express');
var branchOfficeController = require('../controllers/branchOffice.controller');
var mdAuth = require('../middlewares/authenticated');

var api = express.Router();

api.put('/:idC/saveBranch', mdAuth.authenticated, branchOfficeController.saveBranchOffice);
api.put('/:idC/updateBranch/:idS', mdAuth.authenticated, branchOfficeController.updateBranchOffice);
api.put('/:idC/removeBranch/:idS', mdAuth.authenticated, branchOfficeController.removeBranchOffice);

module.exports = api;