const express = require("express");
const app = express();

const mongoose = require("./db/mongoose");

const bodyParser = require("body-parser");

// Load in the mongoose models
const { List, Task, User } = require("./db/models");

// Load middleware
app.use(bodyParser.json());

// CORS HEADER MIDDLEWARE
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, HEAD, OPTIONS, PUT, PATCH, DELETE"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

/* ---------------------------------------
------------ LIST ROUTES ------------
----------------------------------------- */

app.get("/lists", (req, res) => {
  // want to return array of all the lists in the database
  List.find()
    .then((lists) => {
      res.send(lists);
    })
    .catch((e) => {
      res.send(e);
    });
});

app.post("/lists", (req, res) => {
  // want to create new list and return new list doc to user (including id)
  // the list information (fieleds) will be passed in via JSON req body
  let title = req.body.title;

  let newList = new List({
    title,
  });
  newList.save().then((listDoc) => {
    res.send(listDoc);
  });
});

app.patch("/lists/:id", (req, res) => {
  // We want to update the specified list (list doc with id in the URL) with new values specified in the JSON body of the request
  List.findOneAndUpdate(
    { _id: req.params.id },
    {
      $set: req.body,
    }
  ).then(() => {
    res.sendStatus(200);
  });
});

app.delete("/lists/:id", (req, res) => {
  // We want to delete the specified list (document with id in the URL)
  List.findOneAndRemove({
    _id: req.params.id,
  }).then((removedListDoc) => {
    res.send(removedListDoc);
  });
});

/* ---------------------------------------
------------ TASK ROUTES ------------
----------------------------------------- */

app.get("/lists/:listId/tasks", (req, res) => {
  // Return all tasks that belong to a specific list
  Task.find({
    _listId: req.params.listId,
  }).then((tasks) => {
    res.send(tasks);
  });
});

app.get("/lists/:listId/tasks/:taskId", (req, res) => {
  Task.find({
    _id: req.params.taskId,
    _listId: req.params.listId,
  }).then((task) => {
    res.send(task);
  });
});

app.post("/lists/:listId/tasks", (req, res) => {
  // We want to create a new task in the list specified by listId
  let newTask = new Task({
    title: req.body.title,
    _listId: req.params.listId,
  });
  newTask.save().then((newTaskDoc) => {
    res.send(newTaskDoc);
  });
});

app.patch("/lists/:listId/tasks/:taskId", (req, res) => {
  Task.findOneAndUpdate(
    { _id: req.params.taskId, _listId: req.params.listId },
    {
      $set: req.body,
    }
  ).then(() => {
    res.send({ message: "Updated Successfully" });
  });
});

app.delete("/lists/:listId/tasks/:taskId", (req, res) => {
  Task.findOneAndRemove({
    _id: req.params.taskId,
    _listId: req.params.listId,
  }).then((removedTaskDoc) => {
    res.send(removedTaskDoc);
  });
});

/* ---------------------------------------
------------ USER ROUTES ------------
----------------------------------------- */

//Signup
app.post("/users", (req, res) => {
  let body = req.body;
  let newUser = new User(body);
  newUser
    .save()
    .then(() => {
      return newUser.createSession();
    })
    .then((refreshToken) => {
      //Session created successfully - refreshToken returned.
      // now generate access auth token for user
      return newUser.generateAccessAuthToken().then((accessToken) => {
        return { accessToken, refreshToken };
      });
    })
    .then((authTokens) => {
      res
        .header("x-refresh-token", authTokens.refreshToken)
        .header("x-access-token", authTokens.accessToken)
        .send(newUser);
    })
    .catch((e) => {
      res.status(400).send(e);
    });
});

app.post("/users/login", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;

  User.findByCredentials(email, password).then((user) => {
    return user
      .createSession()
      .then((refreshToken) => {
        //Session created successfully - refreshToken returned.
        // now generate access auth token for user
        return user.generateAccessAuthToken().then((accessToken) => {
          //access token generated successfully, now gen/return obj containing tokens
          return { accessToken, refreshToken };
        });
      })
      .then((authTokens) => {
        res
          .header("x-refresh-token", authTokens.refreshToken)
          .header("x-access-token", authTokens.accessToken)
          .send(newUser);
      })
      .catch((e) => {
        res.status(400).send(e);
      });
  });
});

app.listen(3000, () => {
  console.log("Server is listening on port 3000");
});
