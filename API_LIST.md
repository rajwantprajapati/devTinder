# DevTinder APIs
 ## AuthRouter: Auth related apis
 - POST /signin
 - POST /signin
 - POST /logout
 
 ## ProfileRouter: Get and update profile details related apis 
 - GET /profile/view
 - PATCH /profile/edit
 - PATCH /profile.password

 ## ConnectionRequestRouter: Connection Request related Status and apis
 - Status: ignore, interested, accepted, rejected

 - POST /request/send/interested/:userId
 - POST /request/send/ignored/:userId
 - POST /request/send/accepted/:userId
 - POST /request/send/rejected/:userId
 
 ## UserRouter: user related routes
 - GET /user/connections
 - GET /user/request/recieved
 - GET /user/feed
