'use strict'

var Company = require('../models/company.model');
var Employee = require('../models/employee.model');
var employeeXlsx = require('mongo-xlsx');

function saveEmployee(req,res){
    let companyID = req.params.idC;
    var employee = new Employee();
    var params = req.body;

    Company.findById(companyID, (err, companyOK)=>{
        if(err){
            res.status(500).send({ message : 'Error general en el servidor'});
        }else if(companyOK){
            if(params.name && params.DPI && params.email && params.password && params.NIT && params.job && params.departament){
                Company.findOne({$or:[{"employees.name":params.name},{"employees.DPI":params.DPI},{"employees.NIT":params.NIT}, {"employees.password": params.password}]},(err,employeeOK)=>{
                    if(err){
                        res.status(500).send({ message : 'Error general en el servidor'});
                    } else if(employeeOK){
                        res.status(200).send({ message : 'Datos de empleado no válidos, estos ya estan ingresados'});
                    } else {
                        employee.name = params.name;
                        employee.DPI = params.DPI;
                        employee.address = params.address;
                        employee.phone = params.phone;
                        employee.email = params.email;
                        employee.password = params.password;
                        employee.NIT = params.NIT;
                        employee.job = params.job;
                        employee.departament = params.departament;
        
                        Company.findByIdAndUpdate(companyID, {$push:{employees: employee}}, {new:true},(err, companyUpdated)=>{
                            if(err){
                                res.status(500).send({message: 'Error general en el servidor'});
                            }else if(companyUpdated){
                                res.send({'Empleado agregado': employee});
                            }else{
                                res.status(404).send({message: 'Empresa no actualizada'});
                            }
                        });   
                    }                
                })
            } else {
                res.status(200).send({ message : 'Debe de ingresar los datos necesarios para agregar un empleado'});
            }
        } else {
            res.status(404).send({ message : 'La empresa indicada no existe, intentélo de nuevo'});
        }
    })
}

function updateEmployee(req,res){
    let companyID = req.params.idC;
    let employeeID = req.params.idE;
    let update = req.body;
    let employeeConsult;

    Company.findOne({_id: companyID, "employees._id":employeeID}, (err,companyUpdated)=>{
        if(err){
            res.status(500).send({ message : 'Error general en el servidor'});
        } else if (companyUpdated){
            employeeConsult = companyUpdated.employees.find(emp => emp._id == employeeID);

            Company.findOne({$or:[{"employees.name":update.name},{"employees.DPI":update.DPI},{"employees.NIT":update.NIT},{"employees.password": update.password}]},(err,employeeOK)=>{
                if(err){
                    res.status(500).send({ message : 'Error general en el servidor'});
                } else if(employeeOK){
                    res.status(200).send({ message : 'Datos de empleado no válidos, estos ya estan ingresados'});
                } else {
                    Company.findOneAndUpdate({_id:companyID, "employees._id":employeeID},{
                        "employees.$.name": update.name || employeeConsult.name,
                        "employees.$.DPI": update.DPI || employeeConsult.DPI,
                        "employees.$.address": update.address || employeeConsult.address,
                        "employees.$.phone": update.phone || employeeConsult.phone,
                        "employees.$.email": update.email || employeeConsult.email,
                        "employees.$.password": update.password || employeeConsult.password,
                        "employees.$.NIT": update.NIT || employeeConsult.NIT,
                        "employees.$.job": update.job || employeeConsult.job,
                        "employees.$.departament": update.departament || employeeConsult.departament
                       },{new:true}, (err,companyUpdated)=>{
                           if(err){
                               res.status(500).send({ message : 'Error general en el servidor'});
                           } else if (companyUpdated){
                               var employeUpdated = companyUpdated.employees.find( employe => employe._id == employeeID);
                               res.status(200).send({ "Empleado actualizado": employeUpdated});
                           } else {
                               res.status(418).send({ message : 'No se a logrado actualizar el empleado indicado'});
                           }
                    })
                }
            })
        } else {
            res.status(418).send({message : 'No se a logrado actualizar el empleado'});
        }
    })
}

function removeEmployee(req,res){
    let companyID = req.params.idC;
    let employeeID = req.params.idE;

    Company.findOneAndUpdate({_id:companyID, "employees._id":employeeID}, {$pull:{employees:{_id:employeeID}}}, {new:true},(err, companyUpdated)=>{
       if(err){
            res.status(500).send({message : 'Error general en el servidor'});
       } else if(companyUpdated){
            res.status(200).send({ message: 'Empresa actualizada, eliminación de empleado', companyUpdated});
       } else {
            res.status(418).send({message : 'Empleado no eliminado debido a que no se encontro el empleado a eliminar'});
       }
    })

}

/*function searchEmploye(req,res){
    let companyID = req.params.idC;
    let search = req.body;
    
    Company.findById(companyID, (err,company)=>{
        if (err){
            res.status(500).send({ message : 'Error general en el servidor'});
        } else if (company){
            var emp = company.employees.find(emp => emp.job = {$regex : search.job});
            res.send(emp);
        } else {
            res.status(404).send({ message : 'No se a encontrado el empleado a buscar'});
        }
    })
}*/

function searchEmploye(req,res){
    let companyID = req.params.idC;
    let search = req.body;
    
    Company.find({_id : companyID}, { $project: { $filter :{ input: "$employees", cond:{ "employees.name" : search.name}}}}, (err,company)=>{
        if (err){
            res.status(500).send({ message : 'Error general en el servidor'});
        } else if (company){
            res.status(200).send({ employee : company});
        } else {
            res.status(404).send({ message : 'No se a encontrado el empleado a buscar'});
        }
    })
}

function searchEmployeName(req,res){
    let companyID = req.params.idC;
    let search = req.body;

    Company.find({_id: companyID, "employees.name": { $regex : search.name}}, (err,company)=>{
        if (err){
            res.status(500).send({ message : 'Error general en el servidor'});
        } else if (company){
            //var employee = company.employees.find(emp => emp.name = { $regex : search});
            res.status(200).send({ employee : company});
        } else {
            res.status(404).send({ message : 'No se a encontrado el empleado a buscar'});
        }
    })
}

function searchEmployeJob(req,res){
    let companyID = req.params.idC;
    let search = req.body;

    Company.find({_id: companyID, "employees.job": { $regex : search.job}}, (err,company)=>{
        if (err){
            res.status(500).send({ message : 'Error general en el servidor'});
        } else if (company){
            res.status(200).send({ employees : company});
        } else {
            res.status(404).send({ message : 'No se a encontrado el empleado a buscar'});
        }
    })
}

function searchEmployeDepartament(req,res){
    let companyID = req.params.idC;
    let search = req.body;

    Company.find({_id: companyID, "employees.departament": { $regex : search.departament}}, (err,company)=>{
        if (err){
            res.status(500).send({ message : 'Error general en el servidor'});
        } else if (company){
            res.status(200).send({ employees : company});
        } else {
            res.status(404).send({ message : 'No se a encontrado el empleado a buscar'});
        }
    })
}

function searchEmployeJob(req,res){
    let companyID = req.params.idC;
    let search = req.params.idE;

    Company.findById(companyID, (err,company)=>{
        if (err){
            res.status(500).send({ message : 'Error general en el servidor'});
        } else if (company){
            var employee = company.employees.find(emp => emp.job = { $regex : search});
            res.status(200).send({ employee : employee});
        } else {
            res.status(404).send({ message : 'No se a encontrado el empleado a buscar'});
        }
    })
}

function listEmployes(req,res){
    let companyID = req.params.idC;

    Company.findById(companyID, (err,company)=>{
        if(err){
            res.status(err).send({message : 'Error general en el servidor'});
        } else if (company){
            res.status(200).send({ employees : company.employees});
        } else {
            res.status(404).send({ message : 'No hay empleados en dicha empresa'});
        }
    })
}

function dataExcel (req,res){
    let companyID = req.params.idC;

    Company.findById(companyID,(err,companies)=>{
        if(err){
            res.status(500).send({ message : 'Error general en el servidor'});
        } else if (companies){
            var model = employeeXlsx.buildDynamicModel(companies.employees);

            employeeXlsx.mongoData2Xlsx(companies.employees,model,(err,exitoso)=>{
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

module.exports = {
    saveEmployee,
    updateEmployee,
    removeEmployee,
    searchEmploye,
    searchEmployeName,
    searchEmployeJob,
    searchEmployeDepartament,
    listEmployes,
    dataExcel
}