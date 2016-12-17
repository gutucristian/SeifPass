var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),          
    MongoClient = require('mongodb').MongoClient,  
    url = 'mongodb://localhost:27017/SeifPass',
    port = process.env.PORT || 8000,       
    spawn = require("child_process").spawn,    
    assert = require('assert'),
    request = require('request'),
    seifPassServerId = 'SeifPass',
    session = require('express-session');
    engine = require('consolidate');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/views/public', express.static(__dirname + '/views/public'));
app.engine('html', engine.nunjucks);
app.set('view engine', 'html');
app.set('public', __dirname + '/public');

app.use(session({
    secret: "This is a secret"
}));

// request({
//     url: "http://localhost:8080/init",
//     method: "POST",
//     json: true,
//     body: {'serverId': seifPassServerId}
// }, function (error, response, body){
//     console.log(response);           
// });

function checkAuth(req, res, next) {
    console.log('check auth called')
    if (!req.session.user_id) {
        res.send('You are not authorized to view this page');
    } else {  
        res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');      
        next();
    }
}

function hardenPassword(username, password, callback){  
    
    console.log('Harden Password:')
    console.log('username: ' + username);
    console.log('password: ' + password);
        
    var process = spawn('python',["pyrelic/vpop.py", "blind", password]);        
    
    // blind password
    process.stdout.on('data', function (data){
                
        var res = (data + '').split('\n');
        var rInv = res[0];
        var blindedPassword = res[1]; // it is also serialized        
        
        console.log('rInv: ' + rInv);
        console.log('blinded password: ' + blindedPassword);
        
        // obtain harden password (y) from seif prf service
        request({
            url: "http://localhost:8080/eval",
            method: "POST",
            json: true,
            body: {'serverId': seifPassServerId, 'username': username, 'blindedPassword': blindedPassword}
        }, function (error, response, body){            
            // unwrap y, deblind it, and wrap it            
            var y = body.y;                                                            
            
            console.log('\nhardened password: ' + y)            
            
            var process1 = spawn('python',["pyrelic/vpop.py", "refine", rInv, y]);
                        
            process1.stdout.on('data', function (data) {
                var y = data + '';
                                
                console.log('(refined) hardened password: ' + y)                                
                                
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
            res.redirect('/signin');
            
        });                     
    
    });   
       
    app.post('/signin', function(req, res) {                        
        
        var tReq = req;
        var tRes = res; 
        var username = req.body.username;        
        var password = req.body.password;                    
    
        function redirect(forward){
            if(forward){                
                tReq.session.user_id = tReq.body.username;
                tRes.redirect('/manager');
            }else{
                tRes.redirect('/signin');
            }
        }
        
        function validateUser(tempPas) {                                    
             
            db.collection('users').findOne({'username': username}, function(err, user){
                if(user.password == tempPas){                                                            
                    redirect(true);                    
                }else{
                    redirect(false);
                } 
            });                        
            
        }
    
        db.collection('users').findOne({'username': username}, function(err, user){                                                                        
            if(user){                                
                console.log('user found in db')                                
                
                hardenPassword(username, password, function(y){                                                                                                                                            
                    validateUser(y);                                                                            
                });    
                                
            }else{
                res.send('no such user exists');
            }
        });
    
    });
    
    app.post('/addPassword', function(req, res){        
        console.log('new password request: ' + req.body.password);
        console.log('username: ' + req.session.user_id);
        console.log('account: ' + req.body.accountName);
        
        var username = req.session.user_id;
        var accountName = req.body.accountName;
        var password = req.body.password;        
        
        function addPasToDb(password){
            db.collection("users").update({"username": username}, {$push: {"accounts": {"name": accountName, "password": password}}})    
        }                
        
        hardenPassword(username, password, function(y) {
            addPasToDb(y);         
        });
        
        res.send({"message": "password added"});
    });
        
    app.get('/manager', checkAuth, function(req, res){

        //console.log('req.session.user_id: ' + req.session.user_id);
        
        db.collection('users').find({"username": req.session.user_id}).toArray(function(err, docs){
            res.render('public/manager.html', {'users': docs});
        });                
                
    });
    
    app.post('/delete_password', function(req, res){
        console.log('delete password called');
        db.collection('users').update({"username": req.session.user_id}, {$pull: {'accounts': {name: req.body.accountName}}})
        res.send({"message": "password deleted"});
    });    
});

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/views/public/home.html');
});

app.get('/signup', function(req, res) {
    res.sendFile(__dirname + '/views/public/signup.html');
});

app.get('/signin', function(req, res) {
    res.sendFile(__dirname + '/views/public/signin.html');
});
   
app.post('/logout', function(req, res){    
    delete req.session.user_id;
    res.redirect('/signin');
});
    
app.listen(port);
console.log('server running on port ' + port);