const {prisma} = require('../prisma/prisma-client');


const PostController = {
    create: async (req, res) => {
        res.send('create');
    },
    getAll: async (req, res) => {
        res.send('getAll');
    },
    getPostById: async (req, res) => {
        res.send('getPostById');
    },
    update: async (req, res) => {
        res.send('update');
    },
    delete: async (req, res) => {
        res.send('delete');
    },

}

module.exports = PostController
