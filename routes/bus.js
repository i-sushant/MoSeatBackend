const express = require("express");
const router = express.Router();
const Bus = require('../models/bus');
const passport = require("passport");


router.post('/search',(req,res) => {
    Bus.find({source:req.body.source.toLowerCase(), destination:req.body.destination.toLowerCase()})
    .then(buses => {
        if(buses.length>=1)
            res.json({buses:buses})
        else{
            res.json({error:"Sorry no buses found on that route"})
        } 
            
    })
    .catch(error => res.json({error:error}));
})
router.get('/addbus',passport.authenticate("jwt",{ session: false }), (req, res) => {
    return res.json({
        "message": "Add a bus"
    });
})
router.post('/addbus',passport.authenticate("jwt",{ session: false }), (req, res) => {
    let availableSeats = [];
    createSeats();
    function checkForLoopComplete(counter) {
        if (counter === parseInt(req.body.capacity)) {
            createBus()
        }
    }
    async function createSeats() {
        for (i = 0; i < parseInt(req.body.capacity); i++) {
            availableSeats.push(i + 1);
            checkForLoopComplete(i + 1);
        }
    }
    async function createBus() {
        const body = {
            departureTime: req.body.departureTime,
            arrivalTime: req.body.arrivalTime,
            fare: parseInt(req.body.fare),
            capacity: parseInt(req.body.capacity),
            source: req.body.source.toLowerCase(),
            destination: req.body.destination.toLowerCase(),
            availableSeats: availableSeats,
            reservedSeats: [],
            registrationNumber:req.body.registrationNumber
        }
        const bus = new Bus(body);
        await bus.save();
        return res.status(200).json(bus);
    }
});

module.exports = router;