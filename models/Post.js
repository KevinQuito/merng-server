// Another model
const { model, Schema } = require('mongoose');

const postSchema = new Schema({

    body: String,
    username: String,
    createdAt: String,
    comments: [
        {
            body: String,
            username: String,
            createdAt: String
        }
    ],
    likes: [
        {
            username: String,
            createdAt: String
        }
    ],// mongoDB is schema-less, and doesn't have relations, but ORM itself lets us have relations between our models
    // we don't need to do this, but we can link the data models like linking the user below to a specific post
    user: {
        type: Schema.Types.ObjectId,
        ref: 'users'    // we pass in the table/collection AKA users to ref, which allows us to use mongoose to automcailly populate the user field
    }

})

module.exports = model('Post', postSchema);