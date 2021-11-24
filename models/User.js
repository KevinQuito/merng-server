// This will hold the details of the schema. MongoDB is schema-less but with mongoose we can specify a schema to have more safety when working with our server code

// destructure model, meaning unpack values from arrays/objects into distinct variables
const { model, Schema } = require('mongoose');

const userSchema = new Schema({
    // pass in the fields username, which will be unique to each user
    // we can say username: {type: String, required: true} but since we're using GraphQL as the middleman, we'll just use GraphQL itself to say if the fields are required 
    // in the GraphQL layer and not in the Mongoose layer
    username: String,
    password: String,
    email: String,
    createdAt: String

});

module.exports = model('User', userSchema); // model('nameOfModel', nameOfSchema)
