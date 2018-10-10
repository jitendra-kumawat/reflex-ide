var express = require('express');
var router = express.Router();

/* GET getUsersCount listing. */
router.get('/', function(req, res, next) {
  res.send(JSON.stringify({
    "count": 2020202
  }))
});

module.exports = router;
