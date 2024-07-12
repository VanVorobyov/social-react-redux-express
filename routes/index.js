const express = require('express');
const router = express.Router();
// const multer = require('multer');
const {UserController, PostController, LikeController} = require("../controllers");
const multer = require("multer");
const {authenticateToken} = require("../middleware/auth");


// // -------------------------------------------------- Где будем хранить файлы
const uploadsDestination = 'uploads';
const storage = multer.diskStorage({
    destination: uploadsDestination,
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
});

const upload = multer({storage: storage});
//
// //--------------------------------------------------

/* GET home page. */
router.get('/', (req, res, next) => {
    res.render('index', {title: 'Express'});
});

// Роуты User
router.post('/register', UserController.register);
router.post('/login', UserController.login);
router.get('/current', authenticateToken, UserController.currentUser);
router.get('/users/:id', authenticateToken, UserController.getUserById);
router.put('/users/:id', authenticateToken, UserController.updateUser);

// Роуты Post
router.get('/posts', authenticateToken, PostController.getAllPosts);
router.get('/posts/:id', authenticateToken, PostController.getPostById);
router.post('/posts', authenticateToken, PostController.createPost);
router.delete('/posts/:id', authenticateToken, PostController.deletePost);

// Роуты Like
router.post('/likes', authenticateToken, LikeController.likePost);
router.delete('/likes/:id', authenticateToken, LikeController.dislikePost);


module.exports = router;
