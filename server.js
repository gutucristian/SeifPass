var express = require('express');
var app = express();    
var port = 8000; 
var bodyParser = require('body-parser');
var request = require('request');
var seifPassServerId = 'SeifPass';
var spawn = require('child_process').spawn;
var MongoClient = require('mongodb').MongoClient;  
var url = 'mongodb://localhost:27017/SeifPass';
var assert = require('assert');

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

function hardenPassword(username, password, callback){
    console.log('├── harden password');
    console.log('│   ├── username: ' + username);
    console.log('│   ├── password: ' + password);    
    
    // NOTE: I have no idea why, but I need to but those place holder values for child_process to call pyrelic
    var process = spawn('python',['pyrelic/vpop.py', 'blind', password, 'placeholder', 'placeholder']);
    
    // blind password
    process.stdout.on('data', function (data){
        console.log('│   ├── res: ' + data);
        var res = (data + '').split('\n');
        var rInv = res[0];
        var blindedPassword = res[1]; // it is also serialized
        
        console.log('│   ├── rInv: ' + rInv);
        console.log('│   ├── blindedPassword: ' + blindedPassword);
        
        // obtain harden password (y) from seif prf service
        request({
            url: "http://localhost:8080/eval",
            method: "POST",
            json: true,
            body: {'serverId': seifPassServerId, 'username': username, 'blindedPassword': blindedPassword}
        }, function (error, response, body){            
            // unwrap y, deblind it, and wrap it            
            var y = body.y;                                                
            console.log('│   ├── hardenPassword: ' + y);
            
            var process1 = spawn('python',['pyrelic/vpop.py', 'test', rInv, y, 'placeholder']);
                        
            process1.stdout.on('data', function (data) {
                var y = data + '';
                console.log('│   └── hardenPassword (refined): ' + y);
                callback(y);
            });                                                                       
        });    
                                            
    });
}

MongoClient.connect(url, function(err, db){
    
    app.post('/signup', function(req, res) {               
        var username = req.body.username;
        var email = req.body.email;
        var password = req.body.password;
        
        hardenPassword(username, password, function(y){
            db.collection('users').insertOne({'username': username, 'email': email, 'password': y});
            console.log('├── added ' + username + ' to db');
            res.sendFile(__dirname + '/signin.html');
        });                     
    
    });         
       
    app.post('/signin', function(req, res) {        
        console.log('├── sign in');
        
        var username = req.body.username;        
        var password = req.body.password;        
    
        console.log('username: ' + username);
    
        function validateUser(tempPas) {            
            
            db.collection('users').findOne({'username': username}, function(err, user){
                console.log('user.password: ' + user.password);
                console.log('tempPas: ' + tempPas);
                
                if(user.password == tempPas){
                    // req.session.user_id = username;
                    res.sendFile(__dirname + '/manager.html');
                }else{
                    res.send('bad pass');
                } 
            });                        
            
        }
    
        db.collection('users').findOne({'username': username}, function(err, user){                                    
            
            if(user){                                
                console.log('│   ├── user found in db');                                
                
                hardenPassword(username, password, function(y){                                                                                
                    validateUser(y);                                                                            
                });    
                                
            }else{
                res.send('no such user exists');
            }
        });
    
    });
    
});

app.post('/logout', function(req, res){
    delete req.session.user_id;
    res.redirect('/signin');
});
    
app.get('/signup', function(req, res) {
    res.sendFile(__dirname + '/signup.html');
});

app.get('/manager', function(req, res) {
    res.sendFile(__dirname + '/manager.html');
});

app.get('/signin', function(req, res) {
    res.sendFile(__dirname + '/signin.html');
});
    
app.listen(port);
console.log('server running on port ' + port);

// ---------------------------------------------------------

// app.post('/signup', function(req, res) {               
//     var username = req.body.username;
//     var email = req.body.email;
//     var password = req.body.password;
    
//     hardenPassword(username, password, function(y){
//         res.sendFile(__dirname + '/signin.html');
//     });
    
//     console.log('username: ' + username);
//     console.log('email: ' + email);
//     console.log('password: ' + password);
    
//     // NOTE: I have no idea why, but I need to but those place holder values for child_process to call pyrelic
//     var process = spawn('python',['pyrelic/vpop.py', 'blind', password, 'placeholder', 'placeholder']);                                     
           
//     process.stdout.on('data', function (data) {
//         var blindedPassword = data + ''; 
//         var res = blindedPassword.split('\n');
//         var rInv = res[0];
//         var xWrapped = res[1];
//         console.log('rInv: ' + rInv);
//         console.log('xWrapped: ' + xWrapped);                
        
//         request({
//             url: "http://localhost:8080/eval",
//             method: "POST",
//             json: true,
//             body: {'serverId': seifPassServerId, 'username': username, 'blindedPassword': xWrapped}
//         }, function (error, response, body){
//             console.log(body);
//             var y = body.y;
            
//             // unwrapY, deblind it, wrap it, and store it as users password in db                        
            
//             console.log("--BEG HARDENING PROCESS--")
//             console.log("rInv:" + rInv);
//             console.log("y:" + y);                                   
            
//             var process1 = spawn('python',['pyrelic/vpop.py', 'test', rInv, y, 'placeholder']);
                        
//             process1.stdout.on('data', function (data) {
//                 console.log('crap: ' + data)
//             });
                                                                       
//         });          
        
//     });                 
   
// });