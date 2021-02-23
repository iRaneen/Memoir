// LOAD CONFIG
require("dotenv").config();

// DEPENDENCIES

const express = require('express');
const app = express();
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const session = require('express-session');
const mongoSessionStore = require("connect-mongo")(session);

let port = process.env.PORT || 3000


const methodOverride = require("method-override");
app.use(methodOverride("_method"));

app.set('view engine', 'ejs');

// MIDDLEWARE
// body parser middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
// use css an js on ejs file
app.use(express.static("public"));
app.use(expressLayouts);

// Connect to database and pull in model(s)
mongoose.connect(
    process.env.MONGO_CONNECTION_URL,
    { useNewUrlParser: true, useUnifiedTopology: true },
    () => console.log(`MongoDb connected to ${process.env.MONGO_CONNECTION_URL}`)
);

app.use(session({
    store: new mongoSessionStore({ mongooseConnection: mongoose.connection }),
    saveUninitialized: true,
    resave: true,
    secret: "Lambda's Super Secret Cookie",
    cookie: { maxAge: 30 * 60 * 1000 },
}))

// routes
app.use(require('./routes/user'))
app.use(require('./routes/memoir'))


app.get('/', (req, res) => {

    res.redirect('/home')

})



// CONNECTIONS
app.listen(port, () => {
    console.log('listening on port: ', port);
  });
  
