var express = require('express');
var app = express();
//basic static server
app.use(express.static(__dirname)).listen(3030);
