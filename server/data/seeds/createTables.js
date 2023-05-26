/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('Comments').truncate()
  await knex('Posts').truncate()
  await knex('Users').truncate()

  await knex('Users').insert([
    {Username: "Rumeysa", UserEmail:"rumeysaakgunn@gmail.com", Password:"$2a$10$dFwWjD8hi8K2I9/Y65MWi.WU0qn9eAVaiBoRSShTvuJVGw8XpsCiq"},
    {Username: "Egg", UserEmail:"egg@gmail.com", Password:"$2a$10$dFwWjD8hi8K2I9/Y65MWi.WU0qn9eAVaiBoRSShTvuJVGw8XpsCiq"},
    {Username: "Bob", UserEmail:"bob@gmail.com", Password:"$2a$10$dFwWjD8hi8K2I9/Y65MWi.WU0qn9eAVaiBoRSShTvuJVGw8XpsCiq"},
  ]);
  
  await knex('Posts').insert([
    {PostText:"Duck", FilePath: "https://images.unsplash.com/photo-1566577134770-3d85bb3a9cc4?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=3750&q=80", UserId:"1"},
    {PostText:"", FilePath: "https://images.unsplash.com/photo-1477763858572-cda7deaa9bc5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1876&q=80", UserId:"1"},
    {PostText:"Famous Egg", FilePath: "https://images.unsplash.com/photo-1477763858572-cda7deaa9bc5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1876&q=80", UserId:"2"},
  ]);

  await knex('Comments').insert([
    {CommentText: "Rubber duck debugging", PostId:"1", UserId:"2"},
    {CommentText: "What’s a duck’s favorite part of the news? The feather forecast.", PostId:"1", UserId:"3"},
    {CommentText: "Eggciting!", PostId:"3", UserId:"1"},
    {CommentText: "Eggcellent!", PostId:"3", UserId:"3"},
  ]);

  await knex('Likes').insert([
    {PostId: "1", UserId:"2"},
    {PostId: "1", UserId:"3"},
    {PostId: "2", UserId:"1"},
    {PostId: "2", UserId:"3"},
  ]);
};
