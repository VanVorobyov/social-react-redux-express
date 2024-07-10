const {prisma} = require('../prisma/prisma-client');


const PostController = {
    createPost: async (req, res) => {
        res.send('create');
    },
    getAllPosts: async (req, res) => {
        res.send('getAll');
    },
    getPostById: async (req, res) => {
        res.send('getPostById');
    },
    updatePost: async (req, res) => {
        res.send('update');
    },
    deletePost: async (req, res) => {
        res.send('delete');
    },

}

module.exports = PostController
