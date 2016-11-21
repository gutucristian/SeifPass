# SeifPass

### v1.0.0

- [x] basic UI (sign in, sign up, manager page loads with user data)
- [x] user can add account w/ password to manager
- [x] user can delete account w/ password from manager
- [x] sessions prevent user from accessing a restricted page, logging out, and then using the back button to access the restricted page again

### v1.1.0
- [x] make a home page
- [ ] alphabetize passwords
- [x] redirect user to sign in page for bad user/pass
- [x] hash password before it gets sent over network

### v1.1.0
- [ ] update entire db by requesting `k'` from seif service

### version naming convention

1.2.3

1 - Major version, UX changes, file format changes, etc. 

2 - Minor features, major bug fixes, etc.

3 - Minor bugs, spelling mistakes, etc.

To Build:

Install MongoDB and run `mongod`. Create a collection called seif and one called SeifPass. Initiate Pythia PRF init command to register with remote crypto service seif.

`db.createCollection('seif')
db.createCollection('SeifPass')`
