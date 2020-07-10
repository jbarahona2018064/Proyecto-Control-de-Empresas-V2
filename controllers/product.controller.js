'use strict'

var Product = require('../models/product.model');
var Company = require('../models/company.model');
var pdf = require('pdfkit');
var fs = require('fs');

function saveProduct(req,res){
    let companyID = req.params.idC;
    let product = new Product();
    let params = req.body;

    if(companyID != req.company.sub){
        res.send({ message : 'Error de permisos para esta ruta'});
    } else {
        Company.findById(companyID, (err,companyFind)=>{
            if(err){
                res.status(500).send({message : 'Error general en el servidor'});
            } else if(companyFind){
                if(params.nameProduct && params.quantity){
                    Company.findOne({ "productsStock.nameProduct": params.nameProduct}, (err, productFind)=>{
                        if(err){
                            res.status(500).send({message : 'Error general en el servidor'});
                        } else if(productFind) {
                            res.send({ message : 'El producto ingresado ya existe en el sistema'});
                        } else {
                            product.nameProduct = params.nameProduct;
                            product.quantity = params.quantity;
                            product.unitPrice = params.unitPrice;
    
                            Company.findByIdAndUpdate(companyID, {$push: {productsStock: product}}, {new: true}, (err,companyUpdated)=>{
                                if(err){
                                    res.status(500).send({message : 'Error general en el servidor'});
                                } else if(companyUpdated){
                                    res.send({'Producto agregado': product});
                                } else {
                                    res.status(404).send({ message : 'No se encontró la empresa a actualizar'});
                                }
                            })
                        }
                    })
                } else {
                    res.send({ message : 'Debe de ingresar los datos necesarios para agregar un producto'});
                }
            } else {
                res.status(404).send({ message : 'No se a encontrado la empresa indicada'});
            }
        })
    } 
}

function setProductBranchOffice(req,res){
    let companyID = req.params.idC;
    let branchID = req.params.idB;
    let product = req.body;

    if(companyID != req.company.sub){
        res.send({ message : 'Error de permisos para esta ruta'});
    } else {
        Company.findById(companyID, (err,companyFind)=>{
            if(err){
                res.status(500).send({ message : 'Error general en el servidor'});
            } else if(companyFind){
                if(product.idProduct && product.quantity){
                    let productConsult = companyFind.productsStock.find(pro => pro._id == product.idProduct);

                Company.findOne({"branchOffices.productsStock.nameProduct": productConsult.nameProduct}, (err, companyFind)=>{
                        if(err){
                            res.status(500).send({ message : 'Error general en el servidor'});
                        } else if (companyFind){
                            if(product.quantity > 0 && product.quantity <= productConsult.quantity){
                                let branchSaved = companyFind.branchOffices.find(branch => branch._id == branchID);
                                let productSaved2 = branchSaved.productsStock.find(pro => pro._id == product.idProduct);

                                if(productSaved2){
                                    let productPlus = parseInt(product.quantity) + parseInt(productSaved2.quantity);
                                    let lessProduct = productConsult.quantity - product.quantity;

                                    Company.findOneAndUpdate({_id:companyID, "productsStock._id":product.idProduct},{ "productsStock.$.quantity": lessProduct}, {new: true}, (err,companyUpdated)=>{
                                        if(err){
                                            res.status(500).send({ message : 'Error general en el servidor'});
                                        } else if(companyUpdated){
                                            
                                        } else {
                                            res.status(404).send({ message : 'No se a podido actualizar la cantidad de producto en Stock General'});
                                        }
                                    })

                                    Company.findOneAndUpdate({_id: companyID,"branchOffices._id": branchID, "branchOffices.productsStock._id": product.idProduct},{
                                        "branchOffices.$[branch].productsStock.$[product].quantity": productPlus},{arrayFilters:[{'branch._id': branchID}, {'product._id': product.idProduct}]
                                    , new:true},(err, companyUpdated)=>{
                                        if (err){
                                            res.status(500).send({ message : 'Error general en el servidor'});
                                        } else if (companyUpdated){
                                            res.send({ 'Company': companyUpdated});
                                        } else {
                                            res.status(404).send({message: 'No se a logrado actualizar el producto dentro de la sucursal'});
                                        }
                                    })
                                } else {
                                    if(product.quantity <= productConsult.quantity){
                                        let lessProduct = productConsult.quantity - product.quantity;
                                        productConsult.quantity = product.quantity;
                    
                                        Company.findOneAndUpdate({_id: companyID, "branchOffices._id": branchID}, {$push:{"branchOffices.$.productsStock": productConsult}},{new: true},(err,companyUpdated)=>{
                                            if(err){
                                                res.status(500).send({ message : 'Error general en el servidor'});
                                            } else if (companyUpdated){
                                                res.send({ 'Producto agregado': productConsult});
                                            } else {
                                                res.status(404).send({ message : 'No se a logrado ingresar el producto a la sucursal'});
                                            }
                                        })
                    
                                        Company.findOneAndUpdate({_id:companyID, "productsStock._id":product.idProduct},{ "productsStock.$.quantity": lessProduct}, {new: true}, (err,companyUpdated)=>{
                                            if(err){
                                                res.status(500).send({ message : 'Error general en el servidor'});
                                            } else if(companyUpdated){
                    
                                            } else {
                                                res.status(404).send({ message : 'No se a podido actualizar la cantidad de producto en Stock General'});
                                            }
                                        })
                                    } else {
                                        res.status(418).send({ message : 'La cantidad del producto a ingresar excede a la cantidad disponible en Stock general'});
                                    }     
                                }
                            } else {
                                res.status(418).send({ message : 'La cantidad del producto a ingresar excede a la cantidad disponible en Stock general'});
                            }
                        } else {
                            if(product.quantity <= productConsult.quantity){
                                let lessProduct = productConsult.quantity - product.quantity;
                                productConsult.quantity = product.quantity;
            
                                Company.findOneAndUpdate({_id: companyID, "branchOffices._id": branchID}, {$push:{"branchOffices.$.productsStock": productConsult}},{new: true},(err,companyUpdated)=>{
                                    if(err){
                                        res.status(500).send({ message : 'Error general en el servidor'});
                                    } else if (companyUpdated){
                                        res.send({ 'Producto agregado': productConsult});
                                    } else {
                                        res.status(404).send({ message : 'No se a logrado ingresar el producto a la sucursal'});
                                    }
                                })
            
                                Company.findOneAndUpdate({_id:companyID, "productsStock._id":product.idProduct},{ "productsStock.$.quantity": lessProduct}, {new: true}, (err,companyUpdated)=>{
                                    if(err){
                                        res.status(500).send({ message : 'Error general en el servidor'});
                                    } else if(companyUpdated){
            
                                    } else {
                                        res.status(404).send({ message : 'No se a podido actualizar la cantidad de producto en Stock General'});
                                    }
                                })
                            } else {
                                res.status(418).send({ message : 'La cantidad del producto a ingresar excede a la cantidad disponible en Stock general'});
                            }     
                    }
                    })
                } else {
                    res.send({ message : 'Debe de ingresar el id y cantidad deseada del producto'});
                }
            } else {
                res.status(404).send({ message : 'No se a encontrado la empresa indicada'});
            }
        })
    }
}

function updateProduct(req,res){
    let companyID = req.params.idC;
    let productID = req.params.idP;
    let update = req.body;

    if(companyID != req.company.sub){
        res.send({ message : 'Error de permisos para esta ruta'});
    } else {
        if(update.nameProduct || update.quantity || update.unitPrice){
            Company.findById(companyID, (err, companyFind)=>{
                if(err){
                    res.status(500).send({ message : 'Error general en el servidor'});
                } else if (companyFind) {
                    let productConsult = companyFind.productsStock.find(pro => pro._id == productID);

                    Company.findOne({"productsStock.nameProduct": update.nameProduct}, (err, companyFind)=>{
                            if(err){
                                res.status(500).send({ message : 'Error general en el servidor'});
                            } else if (companyFind){
                                res.send({ message : 'El nombre de producto ingresado ya existe en el sistema'});
                            } else {

                                let quantity;

                                if(update.quantity){
                                    quantity = parseInt(update.quantity) + parseInt(productConsult.quantity);
                                } else {
                                    quantity = productConsult.quantity;
                                }

                                Company.findOneAndUpdate({_id:companyID, "productsStock._id": productID}, {
                                    "productsStock.$.nameProduct": update.nameProduct || productConsult.nameProduct,
                                    "productsStock.$.quantity": quantity ,
                                    "productsStock.$.unitPrice": update.unitPrice || productConsult.unitPrice
                                }, {new: true}, (err, companyUpdated)=>{
                                    if(err){
                                        res.status(500).send({ message : 'Error general en el servidor'});
                                    } else if (companyUpdated){
                                        
                                    } else {
                                        res.status(418).send({ message : 'No se a logrado actualizar el producto indicado'});
                                    }
                                })

                                Company.findOneAndUpdate({_id : companyID, "branchOffices.productsStock._id": productID}, {
                                    "branchOffices.$[].productsStock.$[product].nameProduct": update.nameProduct || productConsult.nameProduct},{arrayFilters:[{'product._id': productID}], new:true},(err, companyUpdated)=>{
                                        if(err){
                                            res.status(500).send({ message : 'Error general en el servidor'});
                                        } else if (companyUpdated){
                                            //var productUpdated = companyUpdated.productsStock.find( pro => pro._id == productID);
                                            res.status(200).send({ "Producto actualizado": companyUpdated});
                                        } else {
                                            res.status(418).send({ message : 'No se a logrado actualizar el producto indicado'});
                                        }
                                })
                            }
                        })
                } else {
                    res.status(404).send({message : 'No se encontrado la empresa indicada'});
                }
            })
        } else {
            res.send({ message : 'Ingrese algún dato a actualizar'});
        }
    }
}

function removeProduct(req,res){
    let companyID = req.params.idC;
    let productID = req.params.idP;

    if(companyID != req.company.sub){
        res.send({ message : 'Error de permisos para esta ruta'});
    } else {
        
            Company.findOneAndUpdate({_id: companyID, "productsStock._id": productID}, {$pull:{productsStock:{_id:productID}}}, {new:true},(err, companyFind)=>{
                if (err){
                    res.status(500).send({ message : 'Error general en el servidor'});
                } else if (companyFind) {
                    
                    Company.findOneAndUpdate({_id: companyID, "branchOffices.productsStock._id": productID}, {$pull:{"branchOffices.$[].productsStock":{_id:productID}}},{new:true},(err,companyUpdated)=>{
                        if(err){
                            res.status(500).send({ message : 'Error general en el servidor'});
                        } else if (companyUpdated){
                            res.send({'Company Updated': companyUpdated});
                        } else {
                            res.status(404).send({message : 'No se a logrado eliminar el producto indicado'});
                        }
                    })
                } else {
                    res.status(404).send({ message : 'Producto no eliminado debido a que no se encontró la empresa o producto indicados'});
                }
        })
    }
}

function listProductsOfBranch(req,res){
    let companyID = req.params.idC;
    let branchID = req.params.idB;

    if(companyID != req.company.sub){
        res.send({ message : 'Error de permisos para esta ruta'});
    } else {
        Company.findById(companyID,(err,company)=>{
            if (err){
                res.status(500).send({ message : 'Error general en el servidor'});
            } else if (company){
                let branch = company.branchOffices.find(branch => branch._id == branchID);
                res.send({'Productos de sucursal' : branch.productsStock});
            } else {
                res.status(404).send({ message:  'No se han encontrado registros a mostrar'});
            }
        })
    }
}

function listProducts(req,res){
    let companyID = req.params.idC;

    if(companyID != req.company.sub){
        res.send({ message : 'Error de permisos para esta ruta'});
    } else {
        Company.findById(companyID,(err,company)=>{
            if (err){
                res.status(500).send({ message : 'Error general en el servidor'});
            } else if (company){
                res.send({'Productos de empresa' : company.productsStock});
            } else {
                res.status(404).send({ message:  'No se han encontrado registros a mostrar'});
            }
        })
    }
}

function controlOfStockCompanies(req,res){
    let companyID = req.params.idC;
    let productID = req.params.idP;

    if(companyID != req.company.sub){
        res.send({ message : 'Error de permisos para esta ruta'});
    } else {
        Company.findById(companyID,(err,company)=>{
            if (err){
                res.status(500).send({ message : 'Error general en el servidor'});
            } else if (company){
                var sum = 0;
                company.branchOffices.forEach(element =>{
                    element.productsStock.forEach(element =>{
                        if(element._id == productID){
                            sum = sum + parseInt(element.quantity);
                        }
                    });
                });

                company.productsStock.forEach(element =>{
                    if(element._id == productID){
                        sum = sum + parseInt(element.quantity);
                    }
                });

                res.send({message : 'Productos en Stock:',
                                    company: company.name,
                                    stock:sum});
            } else {
                res.status(404).send({ message: 'No se a encontrado la empresa indicada'});
            }
        })
    }   
}

function controlOfStockBranchOffice(req,res){
    let companyID = req.params.idC;
    let branchID = req.params.idB;
    let productID = req.params.idP;

    if(companyID != req.company.sub){
        res.send({ message : 'Error de permisos para esta ruta'});
    } else {
        Company.findOne({_id:companyID, "branchOffices._id": branchID}, (err, companyFind)=>{
            if(err){
                res.status(500).send({ message : 'Error general en el servidor'});
            } else if(companyFind){
                let branch = companyFind.branchOffices.find(branch => branch._id == branchID);
                let product = branch.productsStock.find(pro => pro._id == productID);

                res.send({ message : 'Cantidad de productos en stock', 
                                    company: companyFind.name,
                                    branchOffice: branch.name,
                                    product: product.name,
                                    stock: product.quantity});
            } else {
                res.status(418).send({ message : 'No se encontraron datos'});
            }
        })
    }
}

function searchProduct(req,res){
    let companyID = req.params.idC;
    let branchID  = req.params.idB;
    let params = req.body;
    let products = [];
    let pro = [];

    if(companyID != req.company.sub){
        res.send({ message : 'Error de permisos para esta ruta'});
    } else {
        switch (params.option){
            case 'Company':
                if(Number.isInteger(parseInt(params.search))){
                    Company.findById(companyID, (err,companies)=>{
                        if(err){
                            res.status(500).send({message : 'Error general en el servidor'});
                        } else if (companies){
                            products = companies.productsStock;
                            for (var i in products){
                                var product = products[i]; 
                                if(product.quantity == params.search){
                                    pro.push(product);
                                }
                                i++;
                            }
                            if(pro.length > 0){
                                res.send({'Products': pro});
                            } else {
                                res.send({message: 'No hay productos con la cantidad ingresada'});
                            }
                        } else {
                            res.status(404).send({ message : 'No se han encontrado registros a mostrar'});
                        }
                    })
                } else {
                    Company.findById(companyID, (err,companies)=>{
                        if(err){
                            res.status(500).send({message : 'Error general en el servidor'});
                        } else if (companies){
                            products = companies.productsStock;
                            for (var i in products){
                                var product = products[i]; 
                                if(product.nameProduct == params.search){
                                    pro.push(product);
                                }
                                i++;
                            }
                            if(pro.length > 0){
                                res.send({'Products': pro});
                            } else {
                                res.send({message: 'No hay productos con el nombre ingresado'});
                            }
                        } else {
                            res.status(404).send({ message : 'No se han encontrado registros a mostrar'});
                        }
                    })
                }
            break;
        
            case 'BranchOffice':
                if(Number.isInteger(parseInt(params.search))){
                    Company.findById(companyID, (err,companies)=>{
                        if(err){
                            res.status(500).send({message : 'Error general en el servidor'});
                        } else if (companies){
                            let branch = companies.branchOffices.find(branch => branch._id == branchID);
                            products = branch.productsStock;

                            for(var a in products){
                                var product = products[a];
                                if(product.quantity == params.search){
                                    pro.push(product);
                                }
                                a++;
                            }

                            if(pro.length > 0){
                                res.send({'Products': pro});
                            } else {
                                res.send({message: 'No hay productos con la cantidad ingresada'});
                            }
                        } else {
                            res.status(404).send({ message : 'No se han encontrado registros a mostrar'});
                        }
                    })
                } else {
                    Company.findById(companyID, (err,companies)=>{
                        if(err){
                            res.status(500).send({message : 'Error general en el servidor'});
                        } else if (companies){
                            let branch = companies.branchOffices.find(branch => branch._id == branchID);
                            products = branch.productsStock;

                            for (var i in products){
                                var product = products[i]; 
                                if(product.nameProduct == params.search){
                                    pro.push(product);
                                }
                                i++;
                            }
                            if(pro.length > 0){
                                res.send({'Products': pro});
                            } else {
                                res.send({message: 'No hay productos con el nombre ingresado'});
                            }
                        } else {
                            res.status(404).send({ message : 'No se han encontrado registros a mostrar'});
                        }
                    })
                }
            break;

            default:
                res.status(404).send({ message : 'Debe de ingresar una opción válida'});
            break;
        }
    }
}

function createPDF (req,res){
    let companyID = req.params.idC;
    let branchID = req.params.idB;

        if(companyID != req.company.sub){
            res.send({ message : 'Error de permisos para esta ruta'});
        } else {
            Company.findById(companyID,(err,company)=>{
                if (err){
                    res.status(500).send({ message : 'Error general en el servidor'});
                } else if (company){
                    let branch = company.branchOffices.find(branch => branch._id == branchID);
                    let products = branch.productsStock;

                    var doc = new pdf();

                    doc.pipe(fs.createWriteStream('./Example.pdf'));

                    doc.fontSize(25).text(company.name, {
                        align: 'center',
                    });

                    for(var pro in products){
                    var product = products[pro];

                    var nameProduct = product.nameProduct;
                    var quantity = product.quantity;
                    var unitPrice = product.unitPrice;
                
                    doc.fontSize(10).text('Name Procuct: ' + nameProduct, {
                        columns: 1
                    });
        
                    doc.fontSize(10).text('Quantity: ' + quantity, {
                        columns: 1
                    });
        
                    doc.fontSize(10).text('unitPrice: ' + unitPrice, {
                        columns: 1
                    });
                    }    
                    
                    doc.end();

                    res.send({message: 'PDF exitoso'});
                } else {
                    res.status(404).send({ message:  'No se han encontrado registros a mostrar'});
                }
            })
    }
}

module.exports = {
    saveProduct,
    setProductBranchOffice,
    updateProduct,
    removeProduct,
    listProductsOfBranch,
    listProducts,
    controlOfStockCompanies,
    controlOfStockBranchOffice,
    searchProduct,
    createPDF
}