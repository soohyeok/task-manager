const express = require("express");
const app = express();

const mongoose = require("./db/mongoose");

const bodyParser = require("body-parser");

// Load in the mongoose models
const { List, Task } = require("./db/models");

// Load middleware
app.use(bodyParser.json());

// Route Handling

// List Routes

/*
    Get /lists
    Purpose: get all lists
*/
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

/*
    POST /lists
    Purpose: Create a list
*/
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

/*
    PATCH /lists/:id
    Purpose: Update a specified list
*/
app.patch("/lists/:id", (req, res) => {
  // We want to update the specified list (list doc with id in the URL) with new values specified in the JSON body of the request
});

/*
    DELETE /lists/:id
    Purpose: Delete a list
*/
app.delete("/lists/:id", (req, res) => {
  // We want to delete the specified list (document with id in the URL)
});

app.listen(3000, () => {
  console.log("Server is listening on port 3000");
});
