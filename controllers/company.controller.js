'use strict'

var Company = require('../models/company.model');
var companyXlsx = require('mongo-xlsx');
var bcrypt = require('bcrypt-nodejs');
var jwt = require('../services/jwt');

function saveCompany(req,res){
    var company = new Company();
    var params = req.body;

    if(params.name && params.ceo && params.businessName && params.NIT && params.activity && params.location && params.email && params.phone && params.user && params.password){
        Company.findOne({$or:[{ name : params.name}, {businessName : params.businessName}, {NIT:params.NIT}, {user: params.user}, {password: params.password}]}, (err,com)=>{
            if(err){
                res.status(500).send({message : 'Error general en el servidor'});
            } else if (com){
                res.status(200).send({message : 'Ya existen los datos de empresa ingresados'});
            } else {
                company.name = params.name;
                company.ceo = params.ceo;
                company.businessName = params.businessName;
                company.NIT = params.NIT;
                company.activity = params.activity;
                company.location = params.location;
                company.email = params.email;
                company.phone = params.phone;
                company.user = params.user;

                bcrypt.hash(params.password, null,null,(err, passwordEncrypt)=>{
                    if(err){
                        res.status(500).send({ message : 'Error general en el servidor'});
                    } else if (passwordEncrypt){
                        company.password = passwordEncrypt;

                        company.save((err,comp)=>{
                            if(err){
                                res.status(500).send({ message : 'Error general en el servidor'});
                            } else if (comp){
                                res.status(200).send({ company : comp});
                            } else {
                                res.status(418).send({ message : 'Error al guardar la empresa'});
                            }
                        })
                    } else {
                        res.send({message : 'No se a podido encriptar la contraseña'});
                    }                    
                })
            }
        })
    } else {
        res.status(200).send({ message: 'Ingrese todos los datos necesarios de la empresa'});
    }
}

function loginCompany(req,res){
    let params = req.body;

    if(params.user && params.password){
        Company.findOne({user : params.user},(err,company)=>{
            if(err){
                res.status(500).send({ message: 'Error general en el servidor'});
            } else if (company){
                bcrypt.compare(params.password, company.password, (err,passwordOK)=>{
                    if(err){
                        res.status(500).send({message : 'Error general en el servidor'});
                    } else if(passwordOK){
                        if(params.gettoken){
                            res.status(200).send({ token : jwt.createToken(company)});
                        } else {
                            res.send({ Bienvenido : company});
                        }
                    } else {
                        res.status(404).send({ message : 'Contraseña ingresada incorrecta'});
                    }
                });
            } else {
                res.status(404).send({ message : 'Datos de empresa incorrectos'});
            }
        })
    } else {
        res.send({ message : 'Debe de ingresar el ususario y contraseña, inténtelo de nuevo'});
    }
}

function updateCompany(req,res) {
    let companyID  = req.params.idC;
    var update = req.body;
    
    if(companyID != req.company.sub){
        res.status(403).send({ message : 'Error de permisos para esta ruta'});
    }else {
        if(update.name || update.businessName || update.NIT || update.user || update.password){
            Company.findOne({$or:[{name:update.name},{businessName:update.businessName}, {NIT:update.NIT}]},(err,company)=>{
                if(err){
                    res.status(500).send({ message : 'Error general en el servidor'});
                } else if(company){
                    res.send({ message : 'Alguno de los datos ingresados ya existe en el sistema'});
                } else {
                    if(update.password){
                        bcrypt.hash(update.password, null,null, (err,passwordHash)=>{
                            if(err){
                                res.status(500),send({ message: 'Error general en el servidor'});
                            } else if (passwordHash){

                                Company.findByIdAndUpdate(companyID, { password : passwordHash} ,{new: true}, (err,updateComp)=>{
                                    if(err){
                                        res.status(500).send({ message : 'Error general en el servidor'});
                                    } else if(updateComp){
                                        res.status(200).send({Company : updateComp});
                                    } else {
                                        res.status(418).send({ message : 'Error al intentar actualizar la empresa'});
                                    }
                                })
                            } else {
                                res.status(404).send({message : 'No se a logrado encriptar la contraseña'});
                            }
                        })
                    }else{
                    
                        Company.findByIdAndUpdate(companyID, update ,{new: true}, (err,updateComp)=>{
                            if(err){
                                res.status(500).send({ message : 'Error general en el servidor'});
                            } else if(updateComp){
                                res.status(200).send({Company : updateComp});
                            } else {
                                res.status(418).send({ message : 'Error al intentar actualizar la empresa'});
                            }
                        })
                    }
                }
            })
        }else{
            Company.findByIdAndUpdate(companyID, update ,{new: true}, (err,updateComp)=>{
                if(err){
                    res.status(500).send({ message : 'Error general en el servidor'});
                } else if(updateComp){
                    res.status(200).send({Company : updateComp});
                } else {
                    res.status(418).send({ message : 'Error al intentar actualizar la empresa'});
                }
            })
        }
    }
}

function deleteCompany (req,res){
    let companyID = req.params.idC;

    if(companyID != req.company.sub){
        res.status(403).send({ message : 'Error de permisos para esta ruta'});
    }else {
        Company.findByIdAndRemove(companyID, (err,companyRemove)=>{
            if(err){
                res.status(500).send({ message : 'Error general en el servidor'});
            } else if(companyRemove){
                res.send({ message : 'Se a eliminado la siguiente empresa',companyRemove});
            } else {
                res.status(418).send({ message : 'Error al intentar eliminar la empresa'});
            }
        })
    }
}

function quantityEmployees(req,res){
    let companyID = req.params.idC;

    if(companyID != req.company.sub){
        res.status(418).send({ message : 'Error de permisos para esta ruta no puede visualizar los empleados de otra empresa'});
    } else {
        Company.findOne({_id:companyID},(err,company)=>{
            if(err){
                res.status(500).send({ message : 'Error general en el servidor'});
            } else if(company){
                var countCompany = company.employees.length;
                res.status(200).send({ "Cantidad de empleados" : countCompany});
            } else {
                res.status(404).send({ message : 'No se a encontrado la empresa solicitada'});
            }
        })
    }
}

function dataExcel (req,res){

    Company.find({},(err,companies)=>{
        if(err){
            res.status(500).send({ message : 'Error general en el servidor'});
        } else if (companies){
            var model = companyXlsx.buildDynamicModel(companies);

            companyXlsx.mongoData2Xlsx(companies,model,(err,exitoso)=>{
                if(err){
                    res.status(500).send({message : 'Error general en el servidor'});
                } else if(exitoso) {
                    res.send({ message : 'Excel generado exitoso'});
                }
            })
        } else {
            res.status(404).send({ message : 'No hay datos para generar el archivo Excel'});
        }
    })
}

function listCompanies (req,res){
    Company.find({}, (err,companies)=>{
        if(err){
            res.status(500).send({ message : 'Error general en el servidor'});
        } else if (companies){
            res.send({ companies : companies});
        } else {
            res.status(404).send({ message : 'No hay empresas registradas en el sistema'});
        }
    })
}

module.exports = {
    saveCompany,
    updateCompany,
    deleteCompany,
    quantityEmployees,
    listCompanies,
    loginCompany,
    dataExcel
}