const express = require('express');
const Users = require('../models/Users');

const v = require('./validators');
const router = express.Router();

/**
 * Create new user.
 * 
 * @name POST /api/users
 */
router.post(
  '/',
  [
    v.ensureUserNotLoggedIn,
    v.ensureValidUserNameInBody,
    v.ensureValidUserPasswordInBody
  ],
  async (req, res) => {
  try {
    // middleware will ensure that this statement below is nonempty!
    const userName = req.body.username;
    const userPassword = req.body.password;
    
    // issue a call to the DB to create a new user with the given username
    let user = await Users.addOne(userName, userPassword);
    res.status(200).json({ user, message: 'Please sign in to continue.' }).end();
  } catch (error) {
    res.status(400).json({ error: "Username must be unique and non-empty" }).end();
  }
});

/**
 * Change username or password of active user.
 * @name PATCH /api/users
 */
router.patch(
  '/', 
  [
    v.ensureUserLoggedIn,
  ],
  async (req, res, next) => {
  try {
    if ('username' in req.body) {
      if (!req.body.username) {
        res.status(400).json({ error: "You must specify a non empty username in the body" }).end();
        return;
      }
      const loggedInUserId = req.session.uid;
      const userName = req.body.username;
      
      let updatedUser = await Users.updateOneName(loggedInUserId, userName);
      res.status(200).json(updatedUser).end();

    } else if ('password' in req.body){
      if (!req.body.password) {
        res.status(400).json({ error: "You must specify a non empty password in the body" }).end();
        return;
      } else if (req.body.password.length < 8) {
        res.status(400).json({ error: "You must specify a password no less than 8 characters in the body" }).end();
        return;
      }

      const loggedInUserId = req.session.uid;
      const userPassword = req.body.password;
        
      let updatedUser = await Users.updateOnePassword(loggedInUserId, userPassword);
      res.status(200).json(updatedUser).end();
    }
  } catch (error) {
    res.status(503).json({ error: `Could not update the user: ${error}` }).end();
  }
});

/**
 * Get a user's name by id.
 * @name PATCH /api/users
 */
router.get(
  '/:id?', 
  [
  ],
  async (req, res, next) => {
  try {
    const userId = req.params.id;
    const user = await Users.findOneId(userId);
    res.status(200).json(user).end();
  } catch (error) {
    res.status(503).json({ error: `Could find the user: ${error}` }).end();
  }
});

/**
 * Delete a user.
 * 
 * @name DELETE /api/users/
 */
router.delete(
  '/',
  [
    v.ensureUserLoggedIn,
  ],
  async (req, res) => {
  try {
    const loggedInUserId = req.session.uid;
    const deletedUser = await Users.deleteOne(loggedInUserId);
    req.session.destroy();

    res.status(200).json(deletedUser).end();
  } catch (error) {
    res.status(503).json({ error: `Could not delete the user: ${error}` }).end();
  }
});

module.exports = router;
