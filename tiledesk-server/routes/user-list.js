var express = require('express');
var router = express.Router();
var User = require('../models/user')
// THE THREE FOLLOWS IMPORTS  ARE USED FOR AUTHENTICATION IN THE ROUTE
var passport = require('passport');
require('../middleware/passport')(passport);
var validtoken = require('../middleware/valid-token')
var userListConstants = require("../models/userListConstants");
const UserEvent = require('../event/userEvent');



router.get('/', function (req, res) {
  User.find({}).

    exec(function (err, users) {
      if (err) {
        winston.error('Error getting users: ', err);
        return res.status(500).send({ success: false, msg: 'Error getting object.' });
      }
      UserEvent.emit('users', users);
      users.reverse();
      res.json(users);
    });
});


router.delete('/:id', function (req, res) {


  User.findByIdAndUpdate(req.params.id, { status: userListConstants.DELETED }, { new: true, upsert: true }, function (err, updatedLead) {
    if (err) {
      winston.error('--- > ERROR ', err);
      return res.status(500).send({ success: false, msg: 'Error updating object.' });
    }


    console.log(updatedLead)
    UserEvent.emit('lead.delete', updatedLead);
    res.json(updatedLead);
  });
});




router.delete('/forever/:id', function (req, res) {

  User.remove({ _id: req.params.id }, function (err, lead) {
    if (err) {
      winston.error('--- > ERROR ', err);
      return res.status(500).send({ success: false, msg: 'Error deleting object.' });
    }

    UserEvent.emit('lead.delete', lead);

    res.json(lead);
  });
});



router.put('/painel/:id', function (req, res) {



  User.findByIdAndUpdate({ _id: req.params.id }, { new: true, upsert: true }, function (err, updatedLead) {
    if (err) {
      winston.error('--- > ERROR ', err);
      return res.status(500).send({ success: false, msg: 'Error updating object.' });
    }

    UserEvent.emit('lead.update', updatedLead);

    res.json(updatedLead);
  });
});

router.get('/:id', function (req, res) {

  User.findOne({ _id: req.params.id }, function (err, user) {

    res.json(user);
  });
});



router.put('/restore/:id', function (req, res) {

  var status = req.body.status;

  User.findByIdAndUpdate({ _id: req.params.id }, { status: status }, { new: true, upsert: true }, function (err, updatedLead) {
    if (err) {
      winston.error('--- > ERROR ', err);
      return res.status(500).send({ success: false, msg: 'Error updating object.' });
    }
  console.log(updatedLead)
    UserEvent.emit('lead.update', updatedLead);
 
    res.json(updatedLead);
  });
});

router.get('/:id', function (req, res) {

  User.findOne({ _id: req.params.id }, function (err, user) {

    res.json(user);
  });
});


router.put('/edit/:id', function (req, res) {

  var update = {};

  if (req.body.email != undefined) {
    update.email = req.body.email;
  }

  if (req.body.firstname != undefined) {
    update.firstname = req.body.firstname;
  }
  if (req.body.cnpj != undefined) {
    update.cnpj = req.body.cnpj;
  }
  if (req.body.endereco != undefined) {
    update.endereco = req.body.endereco;
  }


  if (req.body.bairro != undefined) {
    update.bairro = req.body.bairro;
  }
  if (req.body.cidade != undefined) {
    update.cidade = req.body.cidade;
  }
  if (req.body.estado != undefined) {
    update.estado = req.body.estado;
  }

  if (req.body.n != undefined) {
    update.n = req.body.n;
  }
  if (req.body.complemento != undefined) {
    update.complemento = req.body.complemento;
  }

  if (req.body.responsavel != undefined) {
    update.responsavel = req.body.responsavel;
  }
  if (req.body.emaildoresponsavel != undefined) {
    update.emaildoresponsavel = req.body.emaildoresponsavel;
  }
  if (req.body.telefone != undefined) {
    update.telefone = req.body.telefone;
  }
  if (req.body.nota != undefined) {
    update.nota = req.body.nota;
  }
  console.log(update)

  User.findByIdAndUpdate({ _id: req.params.id }, update, { new: true, upsert: true }, function (err, updatedLead) {
    if (err) {
      winston.error('--- > ERROR ', err);
      return res.status(500).send({ success: false, msg: 'Error updating object.' });
    }



    UserEvent.emit('user.update', updatedLead);

    if (req.body.firstname != undefined) {
      UserEvent.emit('user.firstname.update', updatedLead);
    }

    if (req.body.email != undefined) {
      UserEvent.emit('user.email.update', updatedLead);
    }

    if (req.body.email != undefined || req.body.firstname != undefined) {
      UserEvent.emit('user.firstname.email.update', updatedLead);
    }
    console.log(updatedLead)
    res.json(updatedLead);
  });
});


router.get('/active', function (req, res) {

  var limit = 40; // Number of request per page

  if (req.query.limit) {
    limit = parseInt(req.query.limit);
    winston.debug('LEAD ROUTE - limit: ' + limit);
  }

  var page = 0;

  if (req.query.page) {
    page = req.query.page;
  }

  var skip = page * limit;
  winston.debug('LEAD ROUTE - SKIP PAGE ', skip);


  var query = { "_id": req._id, "status": userListConstants.NORMAL };

  if (req.query.full_text) {
    winston.debug('LEAD ROUTE req.query.fulltext', req.query.full_text);
    query.$text = { "$search": req.query.full_text };
  }

  if (req.query.email) {
    winston.debug('LEAD ROUTE req.query.email', req.query.email);
    query.email = req.query.email;
  }

  if (req.query.with_email) {  //for internal request and zapier to retrieve only lead with an email
    winston.debug('LEAD ROUTE req.query.withemail', req.query.withemail);
    query.email = { "$exists": true };
  }

  if (req.query.with_firstname) {  //or internal request to retrieve only lead with an email
    winston.debug('LEAD ROUTE req.query.withfullname', req.query.with_firstname);
    query.with_firstname = { "$exists": true };
  }

  // aggiungi filtro per data

  if (req.query.status) {
    query.status = req.query.status;
  }

  var direction = -1; //-1 descending , 1 ascending
  if (req.query.direction) {
    direction = req.query.direction;
  }

  var sortField = "createdAt";
  if (req.query.sort) {
    sortField = req.query.sort;
  }

  var sortQuery = {};
  sortQuery[sortField] = direction;

  winston.debug("sort query", sortQuery);

  // TODO ORDER BY SCORE
  // return Faq.find(query,  {score: { $meta: "textScore" } }) 
  // .sort( { score: { $meta: "textScore" } } ) //https://docs.mongodb.com/manual/reference/operator/query/text/#sort-by-text-search-score


  // aggiungi filtro per data marco

  return User.find(query).
    skip(skip).limit(limit).
    sort(sortQuery).
    exec(function (err, leads) {
      if (err) {

        return (err);
      }

      // blocked to 1000 TODO increases it
      //  collection.count is deprecated, and will be removed in a future version. Use Collection.countDocuments or Collection.estimatedDocumentCount instead
      return User.countDocuments(query, function (err, totalRowCount) {

        var objectToReturn = {
          perPage: limit,
          count: totalRowCount,
          leads: leads
        };

        return res.json(objectToReturn);
      });
    });
});


router.get('/trashed', function (req, res, next) {
  var limit = 100000; // Number of leads per page
  var page = 0;
  if (req.query.page) {
    page = req.query.page;
  }
  var skip = page * limit;


  var query = { "_id": req._id, "status": { $lt: userListConstants.DELETED } };

  if (req.query.full_text) {

    query.$text = { "$search": req.query.firstname };
  }

  if (req.query.email) {
    winston.debug('LEAD ROUTE req.query.email', req.query.email);
    query.email = req.query.email;
  }

  var direction = -1; //-1 descending , 1 ascending
  if (req.query.direction) {
    direction = req.query.direction;
  }
  winston.debug("direction", direction);

  var sortField = "createdAt";
  if (req.query.sort) {
    sortField = req.query.sort;
  }
  winston.debug("sortField", sortField);

  var sortQuery = {};
  sortQuery[sortField] = direction;

  winston.debug("sort query", sortQuery);

  // TODO ORDER BY SCORE
  // return Faq.find(query,  {score: { $meta: "textScore" } }) 
  // .sort( { score: { $meta: "textScore" } } ) //https://docs.mongodb.com/manual/reference/operator/query/text/#sort-by-text-search-score


  // Lead.find({ "id_project": req.projectid }, function (err, leads, next) {
  return User.find(query, '-attributes -__v').
    skip(skip).limit(limit).
    sort(sortQuery).lean().
    exec(function (err, leads) {
      if (err) {
        winston.error('LEAD ROUTE - EXPORT CONTACT TO CSV ERR ', err)
        return next(err);
      }
      winston.verbose('LEAD ROUTE - EXPORT CONTACT TO CSV LEADS', leads)

      return res.csv(leads, true);
    });
});





module.exports = router;



