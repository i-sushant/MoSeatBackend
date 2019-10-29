const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Booking = require('../models/bookings')
const userSchema = new Schema({
    email: {
        type: String,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    name: String,
    phoneNumber: {
        type:Number,
        required: [true, 'User phone number required']
    },
    type:String
});

const Users = mongoose.model('User', userSchema);
module.exports = Users;