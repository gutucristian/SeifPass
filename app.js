// spawn pyrelic library
// var spawn = require("child_process").spawn;
// var process = spawn('python',["test.py", "add", 2, 3]);

// process.stdout.on('data', function (data) {
//     console.log('from python script: ' + data);    
// });

var w = "Some super-secret ensemble key selector";
var t = "Totally random and unpredictable tweak";
var x = "asdasd";
var msk = "lkjasdf;lkjas;dlkfa;slkdf;laskdjf";
var s = "Super secret table value";

// 1. Web Server generates 't' (unique user id) 
// 2. Web Server obtains x (user password)
// 3. Web Server blinds x
// 4. Web Server queries pythia server with (w, t, x)

// w: server id
// t: user id
// x: blinded password that needs hardening

// Before everything, Pythia generates a global msk (master secret key) which is a random string
// Pythia receives query (w, t, x)
// Pythia generates a ensemble prekey K[W] (a random string)
// Pythia generates a ensemble key 'kw' unique to server 'w' (kw = HMAC(msk, K[W]))
// Pythia responds to server with hardened password Fkw(t,x)  

var spawn = require("child_process").spawn;
var process = spawn('python',["pyrelic/vpop.py", "blind", w, t, x]);

process.stdout.on('data', function (data) {
    console.log("" + data);    
});