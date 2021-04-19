const mongoose = require("mongoose");
const _ = require("lodash");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");

// JWT SECRET
const jwtSecret = "17tr8839fa24280gw0939gsa40fasf011259kyut99gfs342nus52";

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    minlength: 1,
    trim: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
  },
  sessions: [
    {
      token: {
        type: String,
        required: true,
      },
      expiresAt: {
        type: Number,
        required: true,
      },
    },
  ],
});

/* ---------------------------------------
------------ INSTANCE METHODS ------------
----------------------------------------- */

UserSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();

  // return document except the password and sessions (these shouldnt be made available)
  return _.omit(userObject, ["password", "sessions"]);
};

UserSchema.methods.generateAccessAuthToken = function () {
  const user = this;
  return new Promise((resolve, reject) => {
    //Create JWT
    jwt.sign(
      { _id: user._id.toHexString() },
      jwtSecret,
      { expiresIn: "15m" },
      (err, token) => {
        if (!err) {
          resolve(token);
        } else {
          reject();
        }
      }
    );
  });
};

UserSchema.methods.generateRefreshAuthToken = function () {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(64, (err, buffer) => {
      if (!err) {
        let token = buffer.toString("hex");
        return resolve(token);
      }
    });
  });
};

UserSchema.methods.createSession = function () {
  let user = this;
  return user
    .generateRefreshAuthToken()
    .then((refreshToken) => {
      return saveSessionToDatabase(user, refreshToken);
    })
    .then((refreshToken) => {
      //saved to db successfully; now return ref token
      return refreshToken;
    })
    .catch((err) => {
      return Promise.reject("Failed to save session to database.\n" + err);
    });
};

/* ---------------------------------------
---- MODEL METHODS (static methods) --------
----------------------------------------- */

UserSchema.statics.findByIdAndToken = function (_id, token) {
  // find user by Id and Token, used in auth middleware(verifysession)
  const User = this;

  return User.findOne({
    _id,
    "session.token": token,
  });
};

UserSchema.statics.findByCredentials = function (email, password) {
  let User = this;
  return User.findOne({ email }).then((user) => {
    if (!user) return Promise.reject();

    return new Promise((resolve, reject) => {
      bcrypt.compare(password, user.password, (err, res) => {
        if (res) resolve(user);
        else {
          reject();
        }
      });
    });
  });
};

UserSchema.statics.hasRefreshTokenExpired = (expiresAt) => {
  let secondsSinceEpoch = Date.now() / 1000;
  if (expiresAt > secondsSinceEpoch) {
    // didn't expire
    return false;
  } else {
    // expired
    return true;
  }
};

/* ---------------------------------------
---------------- MIDDLEWARE ---------------
----------------------------------------- */

UserSchema.pre("save", function (next) {
  let user = this;
  let costFactor = 10;
  if (user.isModified("password")) {
    // if the pwd field has been edited/changed then run this code

    // generate salt and hash pwd
    bcrypt.genSalt(costFator, (err, salt) => {
      bcrypt.hash(user.password, salt, (err, hash) => {
        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

/* ---------------------------------------
------------ HELPER METHODS ------------
----------------------------------------- */

let saveSessionToDatabase = (user, refreshToken) => {
  return new Promise((resolve, reject) => {
    let expiresAt = generateRefreshTokenExpiryTime();
    user.sessions.push({ token: refreshToken, expiresAt });
    user
      .save()
      .then(() => {
        // saved session successfully
        return resolve(refreshToken);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

let generateRefreshTokenExpiryTime = () => {
  let daysUntilExpire = "10";
  let secondsUntilExpire = daysUntilExpire * 24 * 60 * 60;
  return Date.now() / 1000 + secondsUntilExpire;
};

const User = mongoose.model("User", UserSchema);

module.exports = { User };
