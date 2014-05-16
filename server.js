var express = require('express');
var morgan = require('morgan');
var app = express();

app.use(express.static("."));
app.use(morgan());

app.get("/", function (req, res) {
  res.status(200).sendfile("globe-search/index.html");
});

app.listen(3000);
console.log("On 3k");
