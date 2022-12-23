var User = require("../models/user");
// var Auth = require("../models/auth");
var mongoose = require('mongoose');
var winston = require('../config/winston');

class UserService {

    signup(email, password, firstname,  cnpj, endereco, bairro,cidade, estado, n, complemento,responsavel, emaildoresponsavel, telefone, nota, emailverified) {
        return new Promise(function (resolve, reject) {

            // winston.info("email: " + email);
            // var emailLowerCase = email;

            // if (email) {
            var emailLowerCase = email.toLowerCase();
            // }
            console.log(email, password, firstname,  cnpj, endereco, bairro,cidade, estado, n, complemento,responsavel, emaildoresponsavel, telefone, nota, emailverified)
            var newUser = new User({
                _id: new mongoose.Types.ObjectId(),
                email: emailLowerCase,
                password: password,
                firstname: firstname,
                cnpj: cnpj,
                endereco: endereco,
                bairro: bairro,
                cidade: cidade,
                estado: estado,
                n: n,
                complemento: complemento,
                responsavel: responsavel,
                emaildoresponsavel: emaildoresponsavel,
                telefone: telefone,
                nota: nota,
                emailverified: emailverified
            });
            // save the user
            newUser.save(function (err, savedUser) {
                if (err) {
                    if (err.code === 11000) { //error for dupes
                        winston.warn('Error creating the user email already present');
                        return reject(err);
                    } else {
                        winston.error('Error creating the user', err);
                        return reject(err);
                    }

                }

                winston.verbose('User created', savedUser.toObject());
                return resolve(savedUser);
            });
        });
    }

}

var userService = new UserService();

module.exports = userService;