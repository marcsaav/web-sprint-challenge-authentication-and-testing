const router = require('express').Router();
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const secret = require('../../config/secret');

const Users = require('./auth-model')

const checkUserExists = require('../middleware/checkUserExists');
const checkCredentials = require('../middleware/checkCredentials');

router.post('/register', checkUserExists, async (req, res) => {
  /*
    IMPLEMENT
    You are welcome to build additional middlewares to help with the endpoint's functionality.

    1- In order to register a new account the client must provide `username` and `password`:
      {
        "username": "Captain Marvel", // must not exist already in the `users` table
        "password": "foobar"          // needs to be hashed before it's saved
      }

    2- On SUCCESSFUL registration,
      the response body should have `id`, `username` and `password`:
      {
        "id": 1,
        "username": "Captain Marvel",
        "password": "2a$08$jG.wIGR2S4hxuyWNcBf9MuoC4y0dNy7qC/LbmtuFBSdIhWks2LhpG"
      }

    3- On FAILED registration due to `username` or `password` missing from the request body,
      the response body should include a string exactly as follows: "username and password required".

    4- On FAILED registration due to the `username` being taken,
      the response body should include a string exactly as follows: "username taken".
  */
      try {
        const credentials = req.body
        const hash = bcrypt.hashSync(credentials.password, 10)
        credentials.password = hash
        const newUser = await Users.add(req.body)
        res
          .status(200)
          .json(newUser)
      }
      catch(err) {
        res
          .status(500)
          .json({ message: 'Could not register new user.'})
      }

});

router.post('/login', checkCredentials,  async (req, res) => {
  /*
    IMPLEMENT
    You are welcome to build additional middlewares to help with the endpoint's functionality.

    1- In order to log into an existing account the client must provide `username` and `password`:
      {
        "username": "Captain Marvel",
        "password": "foobar"
      }

    2- On SUCCESSFUL login,
      the response body should have `message` and `token`:
      {
        "message": "welcome, Captain Marvel",
        "token": "eyJhbGciOiJIUzI ... ETC ... vUPjZYDSa46Nwz8"
      }

    3- On FAILED login due to `username` or `password` missing from the request body,
      the response body should include a string exactly as follows: "username and password required".

    4- On FAILED login due to `username` not existing in the db, or `password` being incorrect,
      the response body should include a string exactly as follows: "invalid credentials".
  */
      try {
        const { username } = req.body
        const user = await Users.findByUsername(username)
        const token = makeToken(user)
        res
          .status(200)
          .json(
            {
              message: `Welcome, ${username}`,
              token: token
            }
          )
      }
      catch(err) {
        res
          .status(500)
          .json({ message: 'Could not log in.'})
      }
});

function makeToken(user) {
  const payload = {
    subject: user.id,
    username: user.username
  }
  const options = {
    expiresIn: '1800s',
  }
  return jwt.sign(payload, secret, options)
}

module.exports = router;
