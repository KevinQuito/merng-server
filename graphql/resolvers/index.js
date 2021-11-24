// SCHEMA

const postsResolvers = require('./post');
const usersResolvers = require('./users');
const commentsResolvers = require('./comments');

module.exports = {
    Post: {
        // PARENT - the parent is the data that comes from getPost, and if you send any type of query or mutation that returns a post, then ti will have to go through the modifier below
        // and add the properties below
        //likeCount: (parent) => parent.likes.length,
        // can do either way, either the one line oc code commentCount or multiple line likeCount
        // likeCount(parent){
        //     console.log(parent);
        //     return parent.likes.length;
        // },
        likeCount: (parent) => parent.likes.length,
        commentCount: (parent) => parent.comments.length
    },
    Query: {
        ...postsResolvers.Query
    },
    Mutation: {
        ...usersResolvers.Mutation,
        ...postsResolvers.Mutation,
        ...commentsResolvers.Mutation
    },
    Subscription: {
        ...postsResolvers.Subscription
    }
};