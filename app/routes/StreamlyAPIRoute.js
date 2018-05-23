'use strict'

let express = require('express');
let Controller = require('../controllers/StreamlyAPIController');
let router = express.Router();

router.get('/clientScreen.js', Controller.clientScreenJS.get);
router.get('/clientScreen.css', Controller.clientScreenCSS.get);

module.exports = router;
