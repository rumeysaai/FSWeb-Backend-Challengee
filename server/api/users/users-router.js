const router = require("express").Router();
const Users = require("./users-model");
const {isUserValid} = require("./users-middleware");

router.get("/", async(req,res,next)=>{
    try {
        
        const allUsers = await Users.getAllUsers();
        res.json(allUsers);

    } catch (error) {
        next(error)
    }
})

router.get("/:id", async(req,res,next)=>{
    try {

        const searchedUser = await Users.getUserById(req.params.id)
        res.json(searchedUser);

    } catch (error) {
        next(error)
    }
})

router.put("/:id", isUserValid, async(req,res,next)=>{
    try {

        const changes = {
            Username: req.body.Username,
            UserEmail: req.body.UserEmail
        };

        const user = await Users.updateUser(req.params.id, req.body);
        res.status(200).json(user);
        
    } catch (error) {
        next(error)
    }
})

module.exports = router;
