'use strict'

let express = require('express');
let Controller = require('../controllers/GeneratorController');
let router = express.Router();

router.get('/', Controller.generator.get);

module.exports = router;
