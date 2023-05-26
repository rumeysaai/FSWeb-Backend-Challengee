const db = require("../../data/db-config");

async function getAllUsers(){
    const allUsers = await db('Users').select('UserId', "Username", "UserEmail");
    return allUsers;
}

async function getUserById(id){
    const user = await db('Users as u').select("u.UserId", "u.Username", "u.UserEmail", "u.Password").where("userId", id).first();
    return user;
}

async function getUserByFilter(filter){
    return await db("Users").where(filter).first();
}

async function createUser(user) {
    const[UserId] = await db("Users").insert(user);
    return await getUserByfilter({UserId : UserId});
}

async function updateUser(id, user){
    const updatedUser = await db("Users").where("UserId", id).update(user);
    return await getUserById(id);
}

module.exports = {
    getAllUsers,
    getUserByFilter,
    getUserById,
    createUser,
    updateUser
}