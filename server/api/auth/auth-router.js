const router = require("express").Router();
const Users = require("../users/users-model")
const bcryptjs = require("bcryptjs")
const jwt = require("jsonwebtoken")
const {JWT_SECRET} = require("../../config/config")
const { 
    payloadCheck,
    usernameCheck,
    emailCheck,
    loginPasswordCheck } = require("./auth-middleware")

function generateToken(payload, expireTime) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: expireTime });
}

router.post("/register", payloadCheck, usernameCheck, emailCheck, async (req, res, next) => {
    try {

        const newUser = {
            Username: req.body.Username,
            UserEmail: req.body.UserEmail,
            Password: bcryptjs.hashSync(req.body.Password)
        }
        const newRecord = await Users.createUser(newUser);
        res.status(201).json(newRecord);

    } catch (error) {
        next(error)
    }
})

router.post("/login", payloadCheck, loginPasswordCheck, async (req, res, next) => {
    try {

        const payload = { Username: req.body.Username, Password:req.body.Password};
        const token = generateToken(payload, "1d");
        res.json({message:`Hoşgeldin ${req.body.Username}`, token:token});

    } catch (error) {
        next(error)
    }
})

module.exports = router;