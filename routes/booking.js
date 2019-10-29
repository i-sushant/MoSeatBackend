const express = require("express");
const router = express.Router();
const Booking = require('../models/bookings');
const Bus = require('../models/bus');
const passport = require("passport");
const sgMail = require('@sendgrid/mail');
const keys = require('../config/keys');

sgMail.setApiKey(keys.sendGridAPIKey);

router.get("/new", passport.authenticate("jwt", { session: false }), (req, res) => {
    res.send("Book now");
})
router.post("/new", passport.authenticate("jwt", { session: false }),(req, res) => {
    if(!req.user){
        return res.json({'message':'User not found'})
    } else {
    const passengerName = req.body.name
    const busId = req.body.busId;
    const source = req.body.source;
    const destination = req.body.destination;
    const initialDate = req.body.journeyDate.split('-');
    const newDate = [initialDate[1],initialDate[2],initialDate[0]].join('-');
    const journeyDate = new Date(newDate);
    const numberOfSeats = parseInt(req.body.totalSeats);
    const totalFare = parseInt(req.body.totalPrice)
    const bookingDetail = {
        name: passengerName,
        source:source,
        destination:destination,
        journeyDate:journeyDate,
        numberOfSeats:numberOfSeats,
        busId:busId,
        passengerName:passengerName,
        totalFare : totalFare
    };
    Bus.findOne({
            _id:req.body.busId
        })
        .then(bus => {
            if (!bus) {
                return res.json({
                    "message": "Bus not found",
                })
            } else {
                if (numberOfSeats > bus.availableSeats.length) {
                    return res.status(200).json({
                        success:false,
                        message: "Not enough seats"
                    });
                } else {
                    let bookedSeats = bus.availableSeats.slice(0, numberOfSeats);
                    const seatsAvailable = bus.availableSeats.slice(0);
                    bus.availableSeats = seatsAvailable.slice(numberOfSeats);
                    bookedSeats.map(seat => bus.reservedSeats.push(seat));
                    bus.save();
                    const bookingDetails = {
                        ...bookingDetail,
                        user: req.user._id,
                        seatNumbers: bookedSeats
                    }
                    Booking.create(bookingDetails)
                        .then(booking => {
                            booking.save();
                            const msg = {
                                to: req.user.email,
                                from: 'bookings@moseat.com',
                                subject: 'Booking successful',
                                text: `This is a confirmation mail that your booking is successful for ${bookingDetail.source} to ${bookingDetail.destination}`,
                                html: `<p>This is a confirmation mail that your booking is successful for ${bookingDetail.journeyDate} from <strong>${bookingDetail.source}</strong> to <strong>${bookingDetail.destination}</strong></p> . <p>Thank You for using MoSeat </p>`,
                            };
                            //sgMail.send(msg).then(sent => console.log("Email sent")).catch(error => console.log("error occured"));
                            return res.json({success:true,booking:booking})
                        })
                        .catch(error => {
                            res.json({
                                success:false,
                                message: "Booking failed"
                            })
                        });
                }
            }
        })
        .catch(error => res.json({
            "message": "Bus does not exist"
        }));
    }

});
router.get('/old',passport.authenticate("jwt", { session: false }) , (req,res) => {
    Booking.find({user:req.user._id})
    .exec()
    .then(bookings => {
        if(!bookings){
            return res.json({message:'No Past Bookings'})
        }
       res.json({bookings:bookings})
    })
    .catch(err => res.json({message:err}));
})
module.exports = router;