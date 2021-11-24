// it's good practice to put the sensitive data in their own file such as config.js
// SECRET_KEY:  doesn't matter what's in here since it will be used as the key to decode the token
module.exports = {
    MONGODB: 'mongodb+srv://KevinQuito:chipmunk1@cluster0.laogv.mongodb.net/merng?retryWrites=true&w=majority',
    SECRET_KEY: 'some very secret key'

}
