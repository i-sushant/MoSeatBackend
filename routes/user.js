const express = require("express");
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/user')
const jwt = require("jsonwebtoken");
const keys = require("../config/keys");


router.get('/register', (req,res) => {
    if(!req.user){
        return res.status(200).json({"message":"Register here"});
    } else {
        return res.status(400).json({"message":"Already registered"});
    }
})
router.post("/register", (req, res) => {
    async function createUser() {
        User.findOne({email : req.body.email})
        .then(user => {
                if (user) {
                    return res.json({
                        success:false,
                        message: "User already present"
                    });
                } else {
                    
                    const body = {
                        name: req.body.name,
                        email:req.body.email.toLowerCase(),
                        password:req.body.password,
                        phoneNumber : parseInt(req.body.phoneNumber),
                    };
                    console.log(body)
                    const user = new User(body);

                    bcrypt.genSalt(10, (err, salt) => {
                        bcrypt.hash(user.password, salt, (err, hash) => {
                            if (err) {return err;};
                            user.password = hash;
                            user.save()
                                .then(user => {
                                    const payload = {
                                        id: user.id,
                                        name: user.name,
                                        email: user.email
                                    }
                                    jwt.sign(
                                    payload,
                                    keys.secretOrKey, {
                                        expiresIn: 3600
                                    },
                                    (err, token) => {
                                        res.json({
                                            success: true,
                                            token: `Bearer ${token}`,
                                            expiresIn: 3600
                                        });
                                    }
                                    )})
                                .catch(err => res.json({
                                    success:false,
                                    message:"Registration failed"
                                }));
                        });
                    });
                }
            });
    }
    createUser();
});


router.get('/login', (req, res) => {
    return res.status(200).send("Login page");
});

router.post("/login", (req, res) => {
    const email = req.body.email.toLowerCase();
    const password = req.body.password;
    User.findOne({email: email})
    .then(user => {
        if (!user) {
            return res.json({success:false, message: "Auth Failed"});
        }
        bcrypt.compare(password, user.password).then(isMatch => {
            if (isMatch) {
                const payload = {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    type:"user"
                };
                jwt.sign(
                    payload,
                    keys.secretOrKey, {
                        expiresIn: 3600
                    },
                    (err, token) => {
                        res.json({
                            success: true,
                            token: `Bearer ${token}`,
                            expiresIn:3600
                        });
                    }
                );
            } else {
                res.json({success:false, message:"Auth Failed"})
            }
        });
    })
    .catch(err => {
        res.json({
            success:false,
            message:'Auth failed'
        })
    })
});


module.exports = router;