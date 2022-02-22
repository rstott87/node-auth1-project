
const Users = require('../users/users-model');
/*
  If the user does not have a session saved in the server

  status 401
  {
    "message": "You shall not pass!"
  }
*/

function restricted(req, res, next) {
  if(req.session.user == null) {
      next({ status: 401, message: 'You shall not pass' });
  } else {
      next();
  }
}

/*
  If the username in req.body already exists in the database

  status 422
  {
    "message": "Username taken"
  }
*/
async function checkUsernameFree(req, res, next) {
  if( await Users.findBy({ username: req.user.username }).first() != null) {
      next({ status: 422, message: `username taken` });
  } else {
      next();
  }
}
/*
  If the username in req.body does NOT exist in the database

  status 401
  {
    "message": "Invalid credentials"
  }
*/
async function checkUsernameExists(req, res, next) {
  const user = await Users.findBy({ username: req.user.username }).first();
  if(user == null) {
      next({ status: 400, message: `invalid credentials` });
  } else {
      req.user = user;
      next();
  }
}

/*
  If password is missing from req.body, or if it's 3 chars or shorter

  status 422
  {
    "message": "Password must be longer than 3 chars"
  }
*/
function checkPasswordLength(req, res, next) {
  if(!req.body.password || req.body.password.length < 3) {
    next({ status: 422, message: 'Password must be longer than 3 chars' });
} else {
    req.user = {
        username: req.body.username.trim(),
        password: req.body.password.trim(),
    };
    next();
}
}

// Don't forget to add these to the `exports` object so they can be required in other modules
module.exports = {
  restricted,
  checkUsernameFree,
  checkPasswordLength,
  checkUsernameExists
}