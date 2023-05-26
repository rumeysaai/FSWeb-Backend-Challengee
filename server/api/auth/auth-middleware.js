const Users = require("../users/users-model");
const { JWT_SECRET } = require("../../config/config");
const jwt = require("jsonwebtoken");
const bcryptjs = require("bcryptjs");

const restricted = (req, res, next) => {
    try {

        const authHeader = req.headers["authorization"];
        if (authHeader) {
            jwt.verify(authHeader, JWT_SECRET, (err, decodedToken) => {
                if (err) {
                    res.status(401).json({ message: "Geçersiz token!" })
                }
                else {
                    req.decodedToken = decodedToken;
                    next();
                }
            })
        }
        else {
            res.status(400).json({ message: "Token gereklidir!" })
        }

    } catch (error) {
        next(error)
    }
}
const payloadCheck = (req, res, next) => {
    try {

        const { Username, Password } = req.body;
        if (!Username || !Password) {
            res.status(400).json({ message: "Username ve password gereklidir" })
        }
        else {
            next()
        }

    } catch (error) {
        next(error)
    }
}

const usernameAndEmailCheck = async (req, res, next) => {
    try {

        const { Username, UserEmail } = req.body;
        const userName = await Users.getUserByFilter({ Username: Username });
        const userEmail = await Users.getUserByFilter({ UserEmail: UserEmail });

        if (userName) {
            res.status(400).json({ message: "Kullanıcı adı başka bir kullanıcı tarafından alınmış!" })
        }
        if (userEmail) {
            res.status(400).json({ message: "Bu e-posta adresi ile kayıtlı bir hesap bulunmaktadır!" })
        }

    } catch (error) {
        next(error)
    }
}

const loginPasswordCheck = async (req, res, next) => {
    try {

        const { Username, Password } = req.body;
        const user = await Users.getUserByFilter({ Username: Username });
        if (!user) {
            res.status(400).json({ message: "Kullanıcı bulunamadı" })
        }
        else {
            let isPasswordValid = bcryptjs.compareSync(Password, user.Password);
            if (!isPasswordValid) {
                res.status(400).json({ message: "Parola hatalı" })
            }
            else {
                next();
            }
        }

    } catch (error) {
        next(error)
    }
}

module.exports = {
    restricted,
    payloadCheck,
    usernameAndEmailCheck,
    loginPasswordCheck,
}