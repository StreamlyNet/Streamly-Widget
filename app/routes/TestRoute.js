'use strict'

let express = require('express');
let Controller = require('../controllers/TestController');
let router = express.Router();

router.get('/', Controller.test.get);

module.exports = router;
