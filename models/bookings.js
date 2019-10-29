const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bookingSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    name:
    {
        type:String,
        required:true
    },
    source: 
    {
        type:String,
        required:true
    },
    destination: 
    {
        type:String,
        required:true
    },
    journeyDate: 
    {
        type:String,
        required:true
    },
    numberOfSeats: 
    {
        type:Number,
        required:true
    },
    seatNumbers: [Number],
    totalFare:Number,
    busId: {
        type: Schema.Types.ObjectId,
        ref: "Bus"
    }
});


const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;