const {user} = require("@prisma/client");
const {prisma} = require("../prisma/prisma-client");
const jdenticon = require("jdenticon/standalone");
const fs = require("fs");

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

            // конвертируем аватар в png, даем имя, помещает в папку uploads
            const png = jdenticon.toPng(name, 200);
            const avatarName = `name_${Date.now()}.png`;
            const avatarPath = path.join(__dirname, '../uploads', avatarName);
            fs.writeFileSync(avatarPath, png);

            // создаем пользователя
            const user = await prisma.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    name,
                    avatarUrl: `/uploads/${avatarPath}`,
                }
            });


            // отправялем пользователя
            res.json(user)

        } catch (e) {
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

