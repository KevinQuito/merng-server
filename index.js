const { ApolloServer } = require('apollo-server'); // brings in the apollo server
const { PubSub } = require('graphql-subscriptions'); // PubSub means publish subscribe

// const gql = require('graphql-tag');
const mongoose = require('mongoose'); // mongoose is ORM library, object-relational mapper, which lets us interface with the mongoDB database that we're using


//======================General convention to keep dependency imports up there and relative imports below==============================
// import our post model
// const Post = require('./models/Post');
const resolvers = require('./graphql/resolvers');
const typeDefs = require('./graphql/typeDefs');
// destructure MONGODB
const { MONGODB } = require('./config.js');

const pubsub = new PubSub(); // we can just pass in pubSub in our context now, so we can use it in our resolvers

const PORT = process.env.port || 5000;
// const typeDefs = gql`
//     type Post{
//         id: ID!
//         body: String!
//         createdAt: String!
//         username: String!
//     }
//     # inside the type Query, we'll have all of our queries and set them up with what type they return
//     type Query{
//         sayHi: String! # an exclamation mark means it's required, it has to return a string, we can have it without it, but having it means we have more type safety
//         # create a query for fetching all the posts
//         # [Post] is a graphQL type
//         getPosts: [Post]
//     }
// `;
// for each query, mutation, or subscription, it has it's corresponding resolver
// const resolvers = {
//     Query: {
//         sayHi: () => 'Hello World!',
//         // if your query fails, it might actually stop your server, which is not good, so we use async to simplify the syntax necessary to consume promise-based APIs
//         async getPosts(){
//                 try{
//                     const posts = await Post.find(); // .find() will find all of them if there isn't anything specified
//                     return posts
//                 }catch(err){
//                     throw new Error(err);
//                 }
//         }

//     }
// }

// we need to set up our apollo server
const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => ({ req, pubsub })
});

mongoose.connect(MONGODB, { useNewUrlParser: true})
    .then(() => {
        console.log('MongoDB Connected');
        return server.listen({ port: PORT});
    })
    .then(res => {
        // server.listen returns a promise so we need a .then
        console.log(`Server running at ${res.url}`);// inject a variable using ${}, the res.url will log it to the console, so we can ctrl + click and open our server
    })// need to catch an error if it happens because an error can crash the server and the app wouldn't run at all
    .catch(err => {
        console.log(err)
    })