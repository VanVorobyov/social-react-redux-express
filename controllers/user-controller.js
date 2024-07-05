const {user} = require("@prisma/client");
const {prisma} = require("../prisma/prisma-client");
const Jdenticon = require("jdenticon");
const fs = require("fs");
const bcrypt = require("bcryptjs");
const path = require("path");


const UserController = {
    register: async (req, res) => {
        const {email, password, name} = req.body;

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

            // Отправляем пользователя
            res.json(user)

        } catch (error) {
            console.error('Error in REGISTER:', error);
            return res.status(500).json({error: 'Internal server error'});
        }
    },
    login: async (req, res) => {
        res.send('login');
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

