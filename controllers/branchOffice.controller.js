'use strict'

var BranchOffice = require('../models/branchOffice.model');
var Company = require('../models/company.model');

function saveBranchOffice(req,res){
    var companyID = req.params.idC;
    var branchOffice = new BranchOffice();
    var params = req.body;

    if(companyID != req.company.sub){
        res.status(418).send({ message : 'Error de permisos para esta ruta'});
    } else {
        Company.findById(companyID, (err,companyFind)=>{
            if(err){
                res.status(500).send({message : 'Error general en el servidor'});
            } else if (companyFind){
                if(params.location && params.phone && params.supervisor && params.email){
                    Company.findOne({ "branchOffices.email" : params.email}, (err, branch)=>{
                        if(err){
                            res.status(500).send({ message : 'Error general en el servidor'});
                        } else if(branch){
                            res.send({message : 'El correo ingresado para la sucursal ya existe en el sistema'});
                        } else {
                            branchOffice.location = params.location;
                            branchOffice.phone = params.phone;
                            branchOffice.supervisor = params.supervisor;
                            branchOffice.email = params.email;
            
                            Company.findByIdAndUpdate(companyID, { $push:{ branchOffices: branchOffice}}, {new : true}, (err,branchSave)=>{
                                if(err){
                                    res.status(500).send({ message : 'Error general en el servidor'});
                                } else if(branchSave){
                                    res.send({ 'Sucursal agregada': branchOffice});
                                } else {
                                    res.status(404).send({ message : 'Error al intentar agregar la sucursal a la empresa'});
                                }
                            })   
                        }
                    })
                } else {
                    res.send({message : 'Debe de ingresar todos los datos necesario para agregar una sucursal'});
                }
            } else {
                res.status(404).send({ message : 'No se a encontrado la empresa indicada para asignar la sucursal'});
            }
        })
    }
}


function updateBranchOffice(req,res){
    let companyID = req.params.idC;
    let branchOfficeID = req.params.idS;
    var update = req.body;
    let branchOfficeConsult;

    if(companyID != req.company.sub){
        res.send({ message : 'Error de permisos para esta ruta'});
    } else {
        Company.findOne({_id: companyID , "branchOffices._id": branchOfficeID}, (err, companyFind)=>{
            if(err){
                res.status(500).send({ message : 'Error general en el servidor'});
            } else if (companyFind){
                branchOfficeConsult = companyFind.branchOffices.find(branch => branch._id == branchOfficeID);

                Company.findOne({"branchOffices.email": update.email}, (err, branchFind)=>{
                    if(err){
                        res.status(500).send({message : 'Error general en el servidor'});
                    } else if (branchFind){
                        res.send({ message : 'El email ingresado para actualizar ya existe en el sistema'});
                    } else {
                        Company.findOneAndUpdate({_id: companyID, "branchOffices._id": branchOfficeID},{
                            "branchOffices.$.location": update.location || branchOfficeConsult.location,
                            "branchOffices.$.phone": update.phone || branchOfficeConsult.phone,
                            "branchOffices.$.supervisor": update.supervisor || branchOfficeConsult.supervisor,
                            "branchOffices.$.email": update.email || branchOfficeConsult.email
                        }, { new: true}, (err,companyUpdated)=>{
                            if(err){
                                res.status(500).send({ message : 'Error general en el servidor'});
                            } else if(companyUpdated) {
                                var branchUpdated = companyUpdated.branchOffices.find(branch => branch._id == branchOfficeID);
                                res.status(200).send({ "Sucursal actualizada": branchUpdated});
                            } else {
                                res.status(418).send({ message : 'No se a logrado actualizar la sucursal indicada'});
                            }
                        })
                    }
                })
            } else {
                res.status(418).send({message : 'No se a logrado actualizar la sucursal'});
            }
        })
    }
}

function removeBranchOffice(req,res){
    let companyID = req.params.idC;
    let branchID = req.params.idS;

    if(companyID != req.company.sub){
        res.send({ message : 'Error de permisos para esta ruta'});
    } else {
        Company.findOneAndUpdate({_id: companyID, "branchOffices._id": branchID}, {$pull:{ branchOffices:{_id: branchID}}},{new:true}, (err, companyUpdated)=>{
            if(err){
                res.status(500).send({ message : 'Error general en el servidor'});
            } else if(companyUpdated){
                res.send({ message: 'Empresa actualizada sucursal eliminada', companyUpdated});
            } else {
                res.status(404).send({ message : 'Sucursal no eliminada debido a que no se encontró la empresa o la sucursal indicadas'});
            }
        })
    }
}

function listBranchOffices(req,res){
    let companyID = req.params.idC;

    if(companyID != req.company.sub){
        res.send({ message : 'Error de permisos para esta ruta'});
    } else {
        Company.findById(companyID, (err,companies)=>{
            if(err){
                res.status(500).send({ message : 'Error general en el servidor'});
            } else if (companies){
                res.send({ 'Branch Offices': companies.branchOffices});
            } else {
                res.status(404).send({ message : 'No se han encontrado registros'});
            }
        })
    }
}

module.exports = {
    saveBranchOffice,
    updateBranchOffice,
    removeBranchOffice,
    listBranchOffices
}