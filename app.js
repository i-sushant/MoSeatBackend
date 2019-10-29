const express = require('express');
const passport = require('passport');
const app = express();
app.use(passport.initialize());
require("./config/passport")(passport);
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const booking = require('./routes/booking');
const user = require('./routes/user');
const bus = require('./routes/bus');
const cors = require('cors');
const keys = require('./config/keys')
mongoose.set('useCreateIndex', true);
mongoose.connect(keys.mongoURImongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}, (db) => console.log("Connected"));

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));


app.get('/', (req, res) => {
    res.send("Hello World!");
});

app.use('/bookings',booking);
app.use('/user', user);
app.use('/bus',bus);




const port = process.env.PORT;   
const IP = process.env.IP ;
app.listen(port ,IP, () => {
    console.log("Server started");
})