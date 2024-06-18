const express = require('express');
const router = express.Router();
const multer = require('multer');


// -------------------------------------------------- Где будем хранить файлы
const uploadsDestination = 'uploads';
const storage = multer.diskStorage({
    destination: uploadsDestination,
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
});

const upload = multer({storage: storage});

//--------------------------------------------------

/* GET home page. */
router.get('/', (req, res, next) => {
    res.render('index', {title: 'Express'});
});

router.get('/register', function (req, res, next) {
    res.send('Register');
});


module.exports = router;
