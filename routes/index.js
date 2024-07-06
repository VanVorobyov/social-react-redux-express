const express = require('express');
const router = express.Router();
// const multer = require('multer');
const {UserController} = require("../controllers");
const multer = require("multer");


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
router.get('/current', UserController.currentUser);
router.get('/users/:id', UserController.login);
router.put('/users/:id', UserController.updateUser);


module.exports = router;
