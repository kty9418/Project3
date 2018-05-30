var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('delivery', { title: 'delivery', username:req.session.username});
});

module.exports = router;
