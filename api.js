require('express');
require('mongodb');
// Add Card
// Incoming: userId, card
// Outgoing: error
exports.setApp = function( app, client){
app.post("/api/addcard", async (req, res, next) => {
  // incoming: userId, color
  // outgoing: error
  const { userId, card } = req.body;
  const newCard = { Card: card, UserId: userId };
  var error = "";
  try {
    const db = client.db("pockProf"); // change to your database name (pockProf)
    // change to your collection name (unnamed for now | will be Cards most likely)
    const result = db.collection("Cards").insertOne(newCard);
  } catch (e) {
    error = e.toString();
  }
  cardList.push(card);
  var ret = { error: error };
  res.status(200).json(ret);
});

// Login
// Incoming: login, password
// Outgoing: id, firstName, lastName, error
app.post("/api/login", async (req, res) => {
  const { login, password } = req.body;

  try {
    const db = client.db("pockProf"); // database name here | this is good
    // this is fine
    const results = await db
      .collection("Users")
      .find({ Login: login, Password: password })
      .toArray();

    let id = -1;
    let fn = "";
    let ln = "";
    let error = "";

    if (results.length > 0) {
      // if no custom UserID, use _id instead
      id = results[0].UserID || results[0]._id;
      fn = results[0].FirstName;
      ln = results[0].LastName;
    } else {
      error = "Invalid username or password";
    }

    const ret = { id, firstName: fn, lastName: ln, error };
    res.status(200).json(ret);
  } catch (err) {
    console.error("Login error:", err.message);
    res
      .status(500)
      .json({ id: -1, firstName: "", lastName: "", error: "Server error" });
  }
});

//Register API
//Incoming: login, password, firstName, lastName
//Outgoing id, firstName, lastName, error 
app.post("/api/register", async(req, res) => {
  const{ login ,password, firstName, lastName} = req.body;

  try{
    const db = client.db("pockProf");

    const existingUser = await db
      .collection("Users")
      .findOne({Login: login});

    let id = -1;
    let fn = "";
    let ln = "";
    let error = "";

    if(existingUser) {
      error = "Username is already taken";
    } else {
      // Insert the new user
      const newUser = {
        Login: login,
        Password: password,
        FirstName: firstName,
        LastName: lastName,
      };

      const result = await db.collection("Users").insertOne(newUser);

      id = result.insertedId.toString();
      fn = firstName;
      ln = lastName;
    }
    
    const ret = { id, firstName: fn, lastName: ln, error };
    res.status(200).json(ret);
  } catch (err) {
    console.error("Registration error:", err.message);
    res
      .status(500)
      .json({ id: -1, firstName: "", lastName: "", error: "Server error" });

  }
  console.log("BODY:", req.body);
});

// Search Cards
// Incoming: userId, search
// Outgoing: results[], error
app.post("/api/searchcards", async (req, res, next) => {
  // incoming: userId, search
  // outgoing: results[], error
  var error = "";
  const { userId, search } = req.body;
  var _search = search.trim();
  const db = client.db("pockProf"); //change database name here (pockProf)
  // change to your collection name
  const results = await db
    .collection("Cards")
    .find({ Card: { $regex: _search + ".*", $options: "i" } })
    .toArray();
  var _ret = [];
  for (var i = 0; i < results.length; i++) {
    _ret.push(results[i].Card);
  }
  var ret = { results: _ret, error: error };
  res.status(200).json(ret);
});
}