var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'ChatAI', message: '¡Habla con nuestra IA!' });
});



module.exports = router;
