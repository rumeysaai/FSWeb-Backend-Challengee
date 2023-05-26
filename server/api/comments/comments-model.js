const db  = require("../../data/db-config");

async function getCommentById(id){
  return await db("Comments").where("CommentId", id).first();
}

async function createComment(comment){
  const [commentId] = await db("Comments").insert(comment);
  return await getCommentById(commentId)

}

async function removeComment(id){
    return await db("Comments").where("CommentId", Number(id)).del();
}

module.exports={
    getCommentById,
    createComment,
    removeComment
}