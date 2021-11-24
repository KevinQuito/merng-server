const { AuthenticationError, UserInputError } = require("apollo-server");

// resolver moved from index.js
const Post = require("../../models/Post");
const checkAuth = require("../../util/check-auth");

module.exports = {
  Query: {
    sayHi: () => "Hello World!",
    // if your query fails, it might actually stop your server, which is not good, so we use async to simplify the syntax necessary to consume promise-based APIs
    async getPosts() {
      try {
        const posts = await Post.find().sort({ createdAt: -1 }); // .find() will find all of them if there isn't anything specified
        return posts;
      } catch (err) {
        throw new Error(err);
      }
    },
    // Add the results from typeDef/getPost below
    async getPost(_, { postId }) {
      try {
        const post = await Post.findById(postId);
        // we could possibly get a post that returns null because it has been deleted, so the following if statement is to ensure
        // that the post exist, and if the post does exist, then just return it, if it doesn't exist, then it'll just throw us an
        // error and say Post not found
        if (post) {
          return post;
        } else {
          throw new Error("Post not found");
        }
        // TODO: for some reason it's not catching the error Post not found
      } catch {
        throw new Error(err);
      }
    },
  },
  Mutation: {
    // we're going to be using context to get the user
    async createPost(_, { body }, context) {
      // if we don't have a header in check-auth.js an error will be thrown, otherwise we'll get a user and it'll return a user
      const user = checkAuth(context);
      console.log(user);

      if(body.trim() === ''){
        throw new Error('Post body must not be empty');
      }

      const newPost = new Post({
        body,
        user: user.indexOf,
        username: user.username,
        createdAt: new Date().toISOString(),
      });

      const post = await newPost.save();
      // the below code is for subscription, after the post has been created and saved, we have access to our context, which holds the pubsub, so we'll use context
      context.pubsub.publish('NEW_POST', {
          // the payload will have newPost with the new value that is saved in post
          newPost: post
      })
      //=======================================================
      return post;
    },
    async deletePost(_, { postId }, context) {
      const user = checkAuth(context);

      try {
        const post = await Post.findById(postId);
        if (user.username === post.username) {
          await post.delete();
          return "Post deleted successfully";
        } else {
          throw new AuthenticationError("Action not allowed");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
    async likePost(_, { postId }, context) {
      const { username } = checkAuth(context);

      const post = await Post.findById(postId);
      if (post) {
        // need to check if post exists
        if (post.likes.find((like) => like.username === username)) {
          // a user can only have one like on a post, so if they already like the post, then we'll automatically delete it
          // post already likes, unlke it
          post.likes = post.likes.filter((like) => like.username !== username);
        } else {
          // not liked, like post
          post.likes.push({
            username,
            createdAt: new Date().toISOString(),
          });
        }

        await post.save();
        return post;
      } else throw new UserInputError("Post not found");
    },
  },
  Subscription: {
      newPost: {
          subscribe: (_, __, { pubsub }) => pubsub.asyncIterator('NEW_POST') // we have no argument, so we can just omit and have two underscores, need to underscores since 
                                                                            // duplicate parameter name is not allowed in this context
      }
  }
};
