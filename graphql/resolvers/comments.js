// made another file since post was getting massive
const { AuthenticationError, UserInputError } = require("apollo-server");

const checkAuth = require("../../util/check-auth");
const Post = require("../../models/Post");

module.exports = {
  Mutation: {
    // can also use an arrow function for example below
    // need context to make sure that our user has actually logged in
    createComment: async (_, { postId, body }, context) => {
      const { username } = checkAuth(context); // if we're here, that means we've logged in, then we'll do basic validation below
      if (body.trim() === "") {
        throw new UserInputError("Empty Comment", {
          errors: {
            body: "Comment body must not be empty",
          },
        });
      }

      const post = await Post.findById(postId); // need await since it's asynchrounous
      //console.log(" this is the post : " + post)
      if (post) {
        post.comments.unshift({
          body,
          username,
          createdAt: new Date().toISOString(),
        });
        await post.save();
        return post;
      } else throw new UserInputError("Post not found");
    },
    async deleteComment(_, { postId, commentId }, context) {
       // console.log(postId)
        
      const { username } = checkAuth(context);

      const post = await Post.findById(postId);
      // console.log(" this is the post : " + post)

      if (post) {
        // we find the index of the comment in the array of comments and then we delete that at that index
        const commentIndex = post.comments.findIndex((c) => c.id === commentId);

        // below we need to check because some user might be trying to delete another user's comments
        if (post.comments[commentIndex].username === username) {
          post.comments.splice(commentIndex, 1);
          await post.save();
          return post;
        } else {
          throw new AuthenticationError("Action not allowed");
        }
      } else {
        throw new UserInputError("Post not found");
      }
    },
  },
};
