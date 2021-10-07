let express = require('express');
let router = express.Router();
let np = require('python-shell')

/* GET users listing. */


router.post('/', function(req, res, next) {
    res.send('respond with a resource');
});

module.exports = router;
