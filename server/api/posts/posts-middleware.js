const Posts = require("./posts-model");

async function checkPostId(req,res,next){
    try {

        let isExist = await Posts.getPostById(req.params.id);
        if(isExist === null){
            res.status(404).json({message:"Post not found"})
        }
        else{
            req.Post = isExist;
            next()
        }
        
    } catch (error) {
        next(error)
    }
}
module.exports={
    checkPostId
}