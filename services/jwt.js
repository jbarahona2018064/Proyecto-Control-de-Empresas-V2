'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');
var key = 'clave_secreta_admin';

exports.createToken = (company)=>{
    // Datos de empresa para generar token
    var payload = {
        sub: company._id,
        name: company.name,
        businessName: company.businessName,
        NIT: company.NIT,
        activity: company.activity,
        location: company.location,
        email: company.email,
        phone: company.phone,
        user: company.user,
        iat: moment().unix(),
        exp: moment().add(10 , "minutes").unix()
    }

    return jwt.encode(payload,key);
}