const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { UserInputError } = require("apollo-server"); // use specific errors from apollo

// need to deconstructure validateRegisterInput since it's not a default export
const { validateRegisterInput, validateLoginInput } = require("../../util/validators");
const { SECRET_KEY } = require("../../config");
const User = require("../../models/User");

function generateToken(user){
  return jwt.sign(
    {
      // this will encode the id, email, username, and password
      id: user.id,
      email: user.email,
      username: user.username,
      // next is we need to give it a secretOrPrivateKey, which we will store in the config file, so we don't have make a mistake by sharing it to people when we push to repository
    },
    SECRET_KEY,
    { expiresIn: "1h" }
  );
}

module.exports = {
  Mutation: {
    // we have four things that we can get in the parent, most of the time we'll just be using args, but parent gives you the result of what was the input from the last
    // step, but in this sceanerio it will be undefined because there was no step before this. in some cases you may have multiple resolvers, but in here we don't need it
    // so we can just put _ . args will have registerInput: RegisterInput as arguments from the typeDefs.js file, which will contain username, password, confirmPassword,
    // email. Info just has some information about some metadata that we mostly don't need
    // register(parent, args, context, info)

    // destructure username and password
    async login(_, { username, password }){
      const { errors, valid } = validateLoginInput(username, password);

      if(!valid){
        throw new UserInputError('Errors', { errors });
      }

      const user = await User.findOne({ username });

      if(!user){
        errors.general = 'User not found';
        throw new UserInputError('User not found', { errors });
      }
      
      const match = await bcrypt.compare(password, user.password);
      if(!match){
        errors.general = 'Wrong credentials';
        throw new UserInputError('Wrong credentials', { errors });
      }
      // user has successfully logged in, means the password is correct, so issue a token for them
      const token = generateToken(user);

      return {
        ...user._doc,
        id: user._id,
        token,
      };

    },

    // destructure the args and further destructure the registerInput
    // now we have access to these four fields separately
    async register(
      _,
      { registerInput: { username, email, password, confirmPassword } }
    ) {
      // TODO: Validate user data
      const { valid, errors } = validateRegisterInput(
        username,
        email,
        password,
        confirmPassword
      );
      if (!valid) {
        throw new UserInputError("Errors", { errors });
      }
      // TODO: Make sure user doesn't already exist
      const user = await User.findOne({ username });
      // if the user already exist, then throw an error or use apollo for specific errors, which the apollo client will recognize and handle those errors differently
      // ('Username is taken', {pass in payload without errors})
      if (user) {
        throw new UserInputError("Username is taken", {
          // this user object is going to be used later on for the front end to display the errors on the form
          errors: {
            username: "This username is taken"
          },
        });
      }
      // TODO: hash password and create an auth token
      // we'll change the value of the password to the hash password, the hashing password is asynchronous, so we have to add the async function to register above
      password = await bcrypt.hash(password, 12);

      const newUser = new User({
        email,
        username,
        password,
        createdAt: new Date().toISOString()
      });
      const res = await newUser.save(); // this saves to the database
      // now we need to return this data to the user, but before that we need to create a token for the user

      const token = generateToken(res)
      return {
        ...res._doc,
        id: res._id,
        token,
      };
    },
  },
};
