const express = require('express');

const Users = require('../models/Users');

// ------------------------------ AUTH

const ensureUserNotLoggedIn = function(req, res, next) {
  if (req.session.uid) {
    res.status(400).json({ error: "You are already signed in!" }).end();
    return;
  }
  next();
};

const ensureUserLoggedIn = function(req, res, next) {
  if (!req.session.uid) {
    res.status(401).json({ error: "Must be signed in!" }).end();
    return;
  }
  next();
};

// ------------------------------ BODY

const ensureValidUserNameInBody = function(req, res, next) {
  if (!req.body.username) {
    res.status(400).json({ error: "You must specify a non empty username in the body" }).end();
    return;
  }
  next();
};

const ensureValidUserPasswordInBody = function(req, res, next) {
  if (!req.body.password) {
    res.status(400).json({ error: "You must specify a non empty password in the body" }).end();
    return;
  } else if (req.body.password.length < 8) {
    res.status(400).json({ error: "You must specify a password no less than 8 characters in the body" }).end();
    return;
  }
  next();
};

// ------------------------------ AUTH

const ensureValidUsernameParam = function(req, res, next) {
  if (!req.params.username) {
    res.status(400).json({ error: "You must specify the non empty name of a User as a parameter" }).end();
    return;
  }
  next();
};

module.exports = {
  ensureUserNotLoggedIn,
  ensureUserLoggedIn,
  ensureValidUserNameInBody,
  ensureValidUserPasswordInBody,
  ensureValidUsernameParam
};
