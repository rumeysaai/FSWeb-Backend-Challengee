const db = require("../../data/db-config");

async function getAllPosts() {
    /*
    SELECT p.PostId, p.PostText, u.Username, c.CommentText, c.UserId, u2.Username as commentUsername, t.LikeCount
    from 
    Posts p
    LEFT JOIN Users as u on u.UserId=p.UserId
    LEFT JOIN Comments as c on c.PostId = p.PostId
    LEFT JOIN Users as u2 on u2.UserId = c.UserId
    LEFT JOIN (select PostId, COUNT(*) as LikeCount from Likes GROUP BY PostId) as t on t.PostId = p.PostId
    ORDER BY p.PostId
    */

    const subquery = await db.select("PostId").count("PostId as LikeCount").from("Likes").groupBy("PostId")

    const posts = await db.select("p.PostId", "p.PostText", "p.FilePath", "u.Username", "c.CommentText", "c.UserId", "us.Username as CommentUsername")
        .from("Posts as p")
        .leftJoin("Users as u", "u.UserId", "p.UserId")
        .leftJoin("Comments as c", "c.PostId", "p.PostId")
        .leftJoin("Users as us", "us.UserId", "c.UserId")
        .orderBy("p.PostId");

    if (posts.length === 0) {
        return null;
    }

    const responseData = [];

    let lastPostId = -1;

    posts.forEach((post) => {

        if (post.PostId != lastPostId) {
            const resObj = {
                "PostId": "",
                "Username": "",
                "FilePath": "",
                "PostText": "",
                "Comments": [],
                "Likes": 0
            }

            resObj.PostId = post.PostId
            resObj.Username = post.Username
            resObj.FilePath = post.FilePath
            resObj.PostText = post.PostText
            if (post.CommentText !== null) {
                resObj.Comments.push(
                    {
                        "CommentText": post.CommentText,
                        "UserId": post.UserId,
                        "Username": post.CommentUsername
                    }
                );
            }

            subquery.forEach(item => {
                if (item.PostId === post.PostId)
                    resObj.Likes = item.LikeCount;
            });

            responseData.push(resObj)

            lastPostId = post.PostId;
        }
        else {
            if (post.CommentText !== null) {
                responseData[responseData.length - 1].Comments.push(
                    {
                        "CommentText": post.CommentText,
                        "UserId": post.UserId,
                        "Username": post.CommentUsername
                    }
                )
            }
        }
    })

    return responseData;

}

async function getPostById(id) {
    const subquery = await db.select("PostId").count("PostId as LikeCount").from("Likes").groupBy("PostId")
    const post = await db.select("p.PostId", "p.PostText", "p.FilePath", "u.Username", "c.CommentText", "c.UserId", "us.Username as CommentUsername")
        .from("Posts as p")
        .leftJoin("Users as u", "u.UserId", "p.UserId")
        .leftJoin("Comments as c", "c.PostId", "p.PostId")
        .leftJoin("Users as us", "us.UserId", "c.UserId")
        .where("p.PostId", Number(id))
        .orderBy("p.PostId")

    if(post.length === 0){
        return null
    }

    const responseData = {
        "PostId": parseInt(id),
        "Username": post[0].Username,
        "FilePath": post[0].FilePath,
        "PostText": post[0].PostText,
        "Comments": [],
        "Likes": 0
    };
    if (post[0].CommentText === null) {
        return responseData;
    }

    post.forEach((item) => {

        let postItem = responseData.Comments.find(c =>
            c.CommentId = item.CommentId)
        if(!postItem){
            let comments = {
                "CommentId": post[0].CommentId,
                "CommentText": post[0].CommentText,
                "UserId": post[0].UserId,
                "Username": post[0].CommentUsername
            }
            responseData.Comments.push(comments);
            
        }
        
        subquery.forEach(item => {
            if (item.PostId === post.PostId)
                responseData.Likes = item.LikeCount;
        });

    })
    return responseData;
}

async function createPost(post) {
    const [postId] = await db("Posts").insert(post);
    return await getPostById(postId);
}

async function removePost(id) {
    return await db("Posts").where("PostId", Number(id)).del();
}

module.exports = {
    getAllPosts,
    getPostById,
    createPost,
    removePost,
}