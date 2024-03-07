import { buildSchema } from "graphql";

const schema = buildSchema(`
    type User {
        _id: ID!
        name: String!
        email: String!
        password: String
        status: String!
        posts: [Post]
    }

    type Post {
        _id: ID!
        title: String!
        imageUrl: String!
        content: String!
        creator: User!
        createdAt: String!
        updatedAt: String!
    }

    type AuthData {
        userId: ID!
        token: String!
    }

    type GetPostsData {
        posts: [Post!]!
        totalItems: Int!
    }

    input SignupInput {
        name: String!
        email: String!
        password: String!
    }

    input LoginInput {
        email: String!
        password: String!
    }

    input CreatePostInput {
        title: String!
        imageUrl: String!
        content: String!
    }

    type RootQuery {
        login(userInput: LoginInput): AuthData!
        getPosts(page: Int): GetPostsData!
        getPost(id: ID!): Post!
        getStatus: String!
    }

    type RootMutation {
        createUser(userInput: SignupInput): User
        createPost(userInput: CreatePostInput): Post
        updatePost(id: ID!, userInput: CreatePostInput): Post
        deletePost(id: ID!): Post
        updateStatus(status: String!): String!
    }

    schema {
        query: RootQuery
        mutation: RootMutation
    }
`);

export default schema;
