"use strict";

/** Routes for users. */

const jsonschema = require("jsonschema");

const express = require("express");
const { ensureLoggedIn } = require("../middleware/auth");
const { BadRequestError, ForbiddenError } = require("../expressError");
const User = require("../models/user");
const { createToken } = require("../helpers/tokens");
const userNewSchema = require("../schemas/userNew.json");
const userUpdateSchema = require("../schemas/userUpdate.json");
const userRegister = require("../schemas/userRegister.json");
const userJobApplication = require("../schemas/userJobApplication.json");

const router = express.Router();


/** POST / { user }  => { user, token }
 *
 * Adds a new user. This is not the registration endpoint --- instead, this is
 * only for admin users to add new users. The new user being added can be an
 * admin.
 *
 * This returns the newly created user and an authentication token for them:
 *  {user: { username, firstName, lastName, email, isAdmin }, token }
 *
 * Authorization required: login
 **/

router.post("/", ensureLoggedIn, async function (req, res, next) {
  try {
    //first validate if the user isAdmin
    
    if(res.locals.user.isAdmin === true){
      const validator = jsonschema.validate(req.body, userNewSchema);
      if (!validator.valid) {
        const errs = validator.errors.map(e => e.stack);
        throw new BadRequestError(errs);
      }
      const user = await User.register(req.body);
      const token = createToken(user);
      return res.status(201).json({ user, token });
    }
    throw new ForbiddenError();
  } catch (err) {
    return next(err);
  }
});


/** GET / => { users: [ {username, firstName, lastName, email }, ... ] }
 *
 * Returns list of all users.
 *
 * Authorization required: login
 **/

router.get("/", ensureLoggedIn, async function (req, res, next) {
  try {
    
    if(res.locals.user.isAdmin === true){
      const users = await User.findAll();
      return res.json({ users });
    }
    throw new ForbiddenError();
  } catch (err) {
    return next(err);
  }
});


/** GET /[username] => { user }
 *
 * Returns { username, firstName, lastName, isAdmin }
 *
 * Authorization required: login
 **/

router.get("/:username", ensureLoggedIn, async function (req, res, next) {
  try {
    const username = req.params && req.params.username;
    if(res.locals.user.isAdmin === true || res.locals.user.username === username){
      const user = await User.get(req.params.username);
      return res.json({ user });
    }
    throw new ForbiddenError();
  } catch (err) {
    return next(err);
  }
});

router.post("/:username/jobs/:jobId", ensureLoggedIn, async function(req, res, next){
  try{
    
    const validator = jsonschema.validate(req.params, userJobApplication);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }
    const username = req.params && req.params.username;
    const jobId = req.params && req.params.jobId;
    if(res.locals.user.isAdmin === true || res.locals.user.username === username){ 
      const response = await User.apply(username, jobId);
      
      return res.status(201).json({applied: response.jobId})
    }
    throw new ForbiddenError();
  }catch(err){
    return next(err);
  }
});

/** PATCH /[username] { user } => { user }
 *
 * Data can include:
 *   { firstName, lastName, password, email }
 *
 * Returns { username, firstName, lastName, email, isAdmin }
 *
 * Authorization required: login
 **/

router.patch("/:username", ensureLoggedIn, async function (req, res, next) {
  try {
    const username = req.params && req.params.username;
    if(res.locals.user.isAdmin === true || res.locals.user.username === username){
      const validator = jsonschema.validate(req.body, userUpdateSchema);
      if (!validator.valid) {
        const errs = validator.errors.map(e => e.stack);
        throw new BadRequestError(errs);
      }
      const user = await User.update(req.params.username, req.body);
      return res.json({ user });
    }
    throw new ForbiddenError();
  } catch (err) {
    return next(err);
  }
});


/** DELETE /[username]  =>  { deleted: username }
 *
 * Authorization required: login
 **/

router.delete("/:username", ensureLoggedIn, async function (req, res, next) {
  try {
    const username = req.params && req.params.username;
    if(res.locals.user.isAdmin === true || res.locals.user.username === username){
      await User.remove(req.params.username);
      return res.json({ deleted: req.params.username });
    }
  } catch (err) {
    return next(err);
  }
});


module.exports = router;
