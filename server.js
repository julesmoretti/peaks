var express = require('express');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var _ = require('underscore');
var async = require('async');

var app = express();
var ig = requite('config.js');

app.use(express.static("."));
app.use(bodyParser());
app.use(morgan());

app.get("/", function (req, res) {
  res.status(200).sendfile("globe-search/index.html");
});

app.listen(3000);
console.log("On 3k");
