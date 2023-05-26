const router = require("express").Router();
const Posts = require("./posts-model");
const {checkPostId} = require("./posts-middleware");

router.get("/", async(req,res,next)=>{
    try {
        
        const posts = await Posts.getAllPosts();
        res.json(posts);

    } catch (error) {
        next(error)
    }
})
router.get("/:id", checkPostId, async(req,res,next)=>{
    try {
        
        const posts = await Posts.getPostById(req.params.id);
        res.json(posts);

    } catch (error) {
        next(error)
    }
})

router.post("/", async(req,res,next)=>{
    try {

        const newPost = {
            PostText:req.body.PostText, 
            FilePath:req.body.FilePath, 
            UserId:req.body.UserId
        }
        const posted = await Posts.createPost(newPost);
        res.status(201).json(posted);
        
    } catch (error) {
        next(error)
    }
})

router.delete("/:id", checkPostId, async(req,res,next)=>{
    try {
        
        const deleted = await Posts.removePost(req.params.id);
        res.status(200).json({message:"Post silindi"})
        
    } catch (error) {
        next(error)
    }
})

module.exports=router;