const {user} = require("@prisma/client");
const {prisma} = require("../prisma/prisma-client");
const Jdenticon = require("jdenticon");
const fs = require("fs");
const bcrypt = require("bcryptjs");
const path = require("path");
const jwt = require("jsonwebtoken");


const UserController = {
    register: async (req, res) => {
        // какие поля принимаем для работы
        const {email, password, name} = req.body;

        // проверяем, заполнены ли обязательные поля
        if (!email || !password || !name) {
            return res.status(400).json({error: 'Все поля обязательные для заполнения'});
        }

        try {
            // проверяем, существует ли пользователь с таким email
            const existingUser = await prisma.user.findUnique({
                where: {email},
            });
            if (existingUser) {
                return res.status(400).json({error: 'Пользователь с таким email уже существует'});
            }

            // хешируем пароль
            const hashedPassword = await bcrypt.hash(password, 10);

            // конвертируем аватар в png, даем имя, помещаем в папку uploads
            const png = Jdenticon.toPng(name, 200);
            const avatarName = `name_${Date.now()}.png`;
            const avatarPath = path.join(__dirname, '/../uploads', avatarName);
            fs.writeFileSync(avatarPath, png);

            // создаем пользователя
            const user = await prisma.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    name,
                    avatarUrl: `/uploads/${avatarName}`,
                }
            });

            // Отправляем пользователя в базу данных
            res.json(user)

        } catch (error) {
            console.error('Error in REGISTER:', error);
            return res.status(500).json({error: 'Internal server error'});
        }
    },
    login: async (req, res) => {
        // какие поля принимаем для работы
        const {email, password} = req.body;

        // проверяем, заполнены ли обязательные поля
        if (!email || !password) {
            return res.status(400).json({error: 'Все поля обязательные для заполнения'});
        }

        try {

            // проверяем, существует ли пользователь с таким email
            const user = await prisma.user.findUnique({
                where: {email},
            })

            // если пользователя нет возвращаем ошибку
            if (!user) {
                return res.status(400).json({error: 'Неверный логин или пароль'});
            }

            // проверяем пароль
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(400).json({error: 'Неверный логин или пароль'});
            }

            // генерируем токен
            const token = jwt.sign({userID: user.id}, process.env.JWT_SECRET, {expiresIn: '1h'});

            // возвращаем токен
            res.json({token});

        } catch (error) {
            console.error("Error in LOGIN: ", error.message);
            return res.status(500).json({error: 'Internal server error'});
        }
    },
    updateUser: async (req, res) => {
        res.send('updateUser');
    },
    getUserById: async (req, res) => {
        res.send('getUserById');
    },
    currentUser: async (req, res) => {
        res.send('currentUser');
    },
}

module.exports = UserController

