var express = require('express');
var app = express();    
var port = process.env.PORT || 8000; 
var bodyParser = require('body-parser');
var request = require('request');
var seifPassServerId = 'vera';
var spawn = require('child_process').spawn;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));

request({
    url: "http://localhost:8080/init",
    method: "POST",
    json: true,
    body: {'serverId': seifPassServerId}
}, function (error, response, body){
    console.log(response);           
});

function validateUser(password){
    // TODO: decrypt password (currently it travels over the wire unencrypted)    
}
    
function createUser(username, password){
    // TODO: decrypt password (currently it travels over the wire unencrypted)
    blindedPassword = '';
    hardenedPassword = eval(seifPassServerId, username, blindedPassword);
    // TODO: store pas in db 
}
    
app.get('/signup', function(req, res) {
    res.sendFile(__dirname + '/signup.html');
});

app.get('/signin', function(req, res) {
    res.sendFile(__dirname + '/signin.html');
});

app.post('/signup', function(req, res) {               
    var username = req.body.username;
    var email = req.body.email;
    var password = req.body.password;
    
    console.log('username: ' + username);
    console.log('email: ' + email);
    console.log('password: ' + password);
    
    // request({
    //     url: "http://localhost:3000/eval",
    //     method: "POST",
    //     json: true,
    //     body: {'w': serverId}
    // }, function (error, response, body){
    //     console.log(response);                
    // });
    
    res.sendFile(__dirname + '/signin.html');
});
   
app.post('/signin', function(req, res) {
    var username = req.body.username;
    var password = req.body.password;
    
    // var tempPas = eval(password)
    // if tempPas == user password, sign user in     
});
    
app.listen(port);
console.log('server running on port ' + port);