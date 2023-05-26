const Users = require("./users-model");

async function isUserValid(req,res,next){

    try {
        
        const isExist = await Users.getUserById(req.params.id);
        if(isExist){
            req.user = isExist;
            next();
        }
        else{
            res.status(400).json({message: `${req.params.id} id'li user bulunamadı!`});
            next();
        }

    } catch (error) {
        next(error)
    }
}

module.exports={
    isUserValid
}