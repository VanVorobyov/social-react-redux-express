const {prisma} = require("../prisma/prisma-client");

const LikeController = {
    likePost: async (req, res) => {
        res.send("likePost")
    },
    dislikePost: async (req, res) => {
        res.send("dislikePost")
    }
}
