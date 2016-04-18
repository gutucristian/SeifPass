var express = require('express');
var app = express();    
var port = 8000; 
var bodyParser = require('body-parser');
var request = require('request');
var seifPassServerId = 'vera';
var spawn = require('child_process').spawn;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));

// NOTE: This is a one time process, in production this will not suffice
// request({
//     url: "http://localhost:8080/init",
//     method: "POST",
//     json: true,
//     body: {'serverId': seifPassServerId}
// }, function (error, response, body){
//     console.log(response);           
// });

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

app.get('/manager', function(req, res) {
    res.sendFile(__dirname + '/manager.html');
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
    
    // NOTE: I have no idea why, but I need to but those place holder values for child_process to call pyrelic
    var process = spawn('python',['pyrelic/vpop.py', 'blind', password, 'placeholder', 'placeholder']);                                     
           
    process.stdout.on('data', function (data) {
        var blindedPassword = data + ''; 
        var res = blindedPassword.split('\n');
        var rInv = res[0];
        var xWrapped = res[1];
        console.log('rInv: ' + rInv);
        console.log('xWrapped: ' + xWrapped);                
        
        request({
            url: "http://localhost:8080/eval",
            method: "POST",
            json: true,
            body: {'serverId': seifPassServerId, 'username': username, 'blindedPassword': xWrapped}
        }, function (error, response, body){
            console.log(body);
            var y = body.y;
            
            // unwrapY, deblind it, wrap it, and store it as users password in db                        
            
            console.log("--BEG HARDENING PROCESS--")
            console.log("rInv:" + rInv);
            console.log("y:" + y);                                   
            
            var process1 = spawn('python',['pyrelic/vpop.py', 'test', rInv, y, 'placeholder']);
                        
            process1.stdout.on('data', function (data) {
                console.log('hardened pas: ' + data)
            });
                                                                       
        });          
        
    });                 
   
});
   
app.post('/signin', function(req, res) {
    var username = req.body.username;
    var password = req.body.password;
    
    // var tempPas = eval(password)
    // if tempPas == user password, sign user in     
});
    
app.listen(port);
console.log('server running on port ' + port);