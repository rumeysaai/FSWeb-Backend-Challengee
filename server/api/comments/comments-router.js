const router = require("express").Router();
const Comments= require("./comments-model");


router.post("/", async(req,res,next)=>{
    try {

        const newComment={
            CommentText:req.body.CommentText,
            PostId:req.body.PostId,
            UserId:req.body.UserId
        }
        const created = await Comments.createComment(newComment)
        res.status(201).json(created);
        
    } catch (error) {
        next(error)
    }
})

router.delete("/:id", async(req,res,next)=>{
    try {

        const deleted = await Comments.removeComment(req.params.id);
        res.status(200).json({message:"Comment silindi"})
        
    } catch (error) {
        next(error)
    }
})

module.exports=router;