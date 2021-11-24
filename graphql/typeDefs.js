// moved from index.js, developer experience - get used to separating things like these because when things like these
// get bigger, the more chaotic it will be

const { gql } = require("apollo-server"); // can import from apollo-server as well as graphql-tag since graphql-tag is a sub-dependency of that

module.exports = gql`
    type Post{
        id: ID!
        body: String!
        createdAt: String!
        username: String!
        comments: [Comment]!
        likes: [Like]!
        likeCount: Int!
        commentCount: Int!
    }
    type Comment{
        id: ID!
        createdAt: String! # TODO: for some reason the createdAt keep returning  Cannot return null for non-nullable field Comment.createdAt.
                            # REASON: the reason was because there were comments that still had createAt instead of createdAt, so the comments that had createAt had a blank
                            # for the field createdAt, we should have deleted the comments that had createAt as soon as we made the changes from createAt to createdAt
        username: String!
        body: String!
    }
    type Like{
        id: ID!
        createdAt: String!
        username: String!
    }
    # type : User below
    type User{
        id: ID!
        email: String!
        token: String!
        username: String!
        createdAt: String!
    }
    input RegisterInput{
        username: String!
        password: String!
        confirmPassword: String!
        email: String!
    }
    # inside the type Query, we'll have all of our queries and set them up with what type they return
    type Query{
        sayHi: String! # an exclamation mark means it's required, it has to return a string, we can have it without it, but having it means we have more type safety
        # create a query for fetching all the posts
        # [Post] is a graphQL type
        getPosts: [Post]
        getPost(postId: ID!): Post # this will take a postId type ID! and return Post
    }
    # before creating the crud functionalities on our posts, like creating/editing/deleting posts, we first need to create ways for our users to authenticate, so let's register them
    type Mutation{
        register(registerInput: RegisterInput): User!    # this will return a type : User
        login(username: String!, password: String!): User!
        createPost(body: String!): Post!
        deletePost(postId: ID!): String!
        createComment(postId: ID!, body: String!): Post!
        deleteComment(postId: ID!, commentId: ID!): Post! # can take th commentId, but taking the postId allows to check if that post is up at all or not
        likePost(postId: ID!): Post! # this will return a type : Post, also notice that we don't have an unlikePost because this likePost will work as a toggle, so if we like that post then we can unlike it and if we unlike that post, then we can like it
    }
    # people use them for polling or chatapps
    type Subscription {
        newPost: Post! # whenever a new post is created, show whoever is subscribed to this "hey, this is the new post that has been created"
    }
`;
