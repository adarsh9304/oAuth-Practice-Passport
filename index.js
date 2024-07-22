const express=require('express');
const path=require('path');
const app=express();
require('./auth');
const passport=require('passport')
const session=require('express-session')

app.use(express.json());
app.use(express.static(path.join(__dirname,'client')));

app.use(session({
    secret:process.env.SESSION_SECRET,
    resave:false,
    saveUninitialized:true,
    coockie:{secure:false}
}))

app.use(passport.initialize());
app.use(passport.session())

function isLogin(req,res,next){
    req.user?next():res.sendStatus(401);
}

app.get('/',(req,res)=>{
    res.sendFile(__dirname + '/index.html');;
})


//This route initiates the Google OAuth authentication process.
app.get('/auth/google',
    passport.authenticate('google', { scope:
        [ 'email', 'profile' ] }
  ));

  
  //This route handles the callback from Google's OAuth 2.0 server after the user has authenticated.
  app.get( '/auth/google/callback',
      passport.authenticate( 'google', {
          successRedirect: '/auth/google/success',
          failureRedirect: '/auth/google/failure'
  }));

  app.get('/auth/google/success',isLogin ,(req,res)=>{
    res.send('Hello from success route')
  })

  app.get('/auth/google/failure',isLogin ,(req,res)=>{
    res.send('Hello from failure route')
  })

  app.get('/auth/protected',isLogin ,(req,res)=>{
    let name=req.user.displayName;

    res.send(`Hello from protected route ${name}`)
  })

  app.listen(3000,()=>{
    console.log('listening port 3000')
  })
  /*

  Complete Authentication Flow
User Initiates Authentication:

User visits /auth/google.
Passport redirects the user to Google's OAuth 2.0 server.
User logs in with Google and grants permission.



Google Redirects to Callback URL:

After successful login, Google redirects the user back to /auth/google/callback with an authorization code.



Passport Handles the Callback:

Passport exchanges the authorization code for an access token and retrieves user information.
Passport calls the verify callback function with the user information.
If authentication is successful, Passport serializes the user and stores the user ID in the session.
The user is redirected to /auth/google/success.




Session Management:

On subsequent requests, Passport deserializes the user using the user ID stored in the session.
The user object is made available in req.user.

  */