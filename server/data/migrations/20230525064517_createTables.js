/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable("Users",tbl=>{
        tbl.increments("UserId")
        tbl.string("Username", 64)
            .unique()
            .notNullable();
        tbl.string("UserEmail", 128)
            .notNullable()
            .unique()
        tbl.integer("Password")
            .notNullable()
    })
    .createTable("Comments", tbl=>{
        tbl.increments("CommentId")
        tbl.string("CommentText", 128)
            .notNullable()
        tbl.integer("PostId")
            .notNullable()
            .references("PostId")
            .inTable("Posts")
            .onDelete("CASCADE")
            .onUpdate("CASCADE")
        tbl.integer("UserId")
            .notNullable()
            .references("UserId")
            .inTable("Users")
            .onDelete("CASCADE")
            .onUpdate("CASCADE");
    })
    .createTable("Posts", tbl=>{
        tbl.increments("PostId")
        tbl.string("PostText",128)
        tbl.string("FilePath").notNullable();
        tbl.integer("UserId")
            .notNullable()
            .references("UserId")
            .inTable("Users")
            .onDelete("CASCADE")
            .onUpdate("CASCADE")
  })
  .createTable("Likes", tbl=>{
    tbl.integer("PostId")
        .notNullable()
        .references("PostId")
        .inTable("Posts")
        .onDelete("CASCADE")
        .onUpdate("CASCADE")
    tbl.integer("UserId")
        .notNullable()
        .references("UserId")
        .inTable("Users")
        .onDelete("CASCADE")
        .onUpdate("CASCADE")
    tbl.primary(["UserId", "PostId"])
})
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTableIfExists("Likes")
    .dropTableIfExists("Comments")
    .dropTableIfExists("Posts")
    .dropTableIfExists("Users");
};
