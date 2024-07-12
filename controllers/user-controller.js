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
            const token = jwt.sign({userId: user.id}, process.env.JWT_SECRET, {expiresIn: process.env.TOKEN_EXPIRES_IN});

            // возвращаем токен
            res.json({token});

        } catch (error) {
            console.error("Error in LOGIN: ", error.message);
            return res.status(500).json({error: 'Internal server error'});
        }
    },

    updateUser: async (req, res) => {
        // Извлекает параметр 'id' из URL запроса => :id
        const {id} = req.params;

        // Извлекает поля пользователя из тела запроса
        const {email, name, dateOfBirth, bio, location} = req.body;

        let filePath;
        // Извлекает путь к файлу, если он был загружен
        if (req.file && req.file.path) {
            filePath = req.file.path;
        }

        // Проверяет, совпадает ли 'id' из параметров с 'userId' аутентифицированного пользователя
        if (id !== req.user.userId) {
            // Возвращает статус 403, если 'id' не совпадает
            return res.status(403).json({error: 'Forbidden'});
        }

        try {
            // Проверяет, существует ли уже пользователь с указанным email
            if (email) {
                const user = await prisma.user.findFirst({
                    where: {email},
                });

                // Если пользователь с таким email существует и это не текущий пользователь, возвращает ошибку
                if (user && user.id !== id) {
                    return res.status(400).json({error: 'Пользователь с таким email уже существует'});
                }
            }

            // Обновляет данные пользователя в базе данных
            const user = await prisma.user.update({
                where: {id},
                data: {
                    // Обновляет email, если он предоставлен, иначе оставляет без изменений
                    email: email || undefined,
                    // Обновляет имя, если оно предоставлено, иначе оставляет без изменений
                    name: name || undefined,
                    // Обновляет дату рождения, если она предоставлена, иначе оставляет без изменений
                    dateOfBirth: dateOfBirth || undefined,
                    // Обновляет биографию, если она предоставлена, иначе оставляет без изменений
                    bio: bio || undefined,
                    // Обновляет местоположение, если оно предоставлено, иначе оставляет без изменений
                    location: location || undefined,
                    // Обновляет путь к аватару, если файл был загружен
                    avatarUrl: filePath
                }
            });

            // Возвращает обновленные данные пользователя
            res.json(user);

        } catch (error) {
            // Логирует любые ошибки, возникшие в процессе обновления
            console.error("Error in UPDATE: ", error.message);
            // Возвращает статус 500 при возникновении ошибки
            return res.status(500).json({error: 'Internal server error'});
        }
    },

    getUserById: async (req, res) => {
        const {id} = req.params; // Извлекает параметр 'id' из URL запроса => :id
        const userId = req.user.userId; // Извлекает 'userId' из информации аутентифицированного пользователя

        try {
            // Пытается найти пользователя в базе данных по указанному 'id'
            const user = await prisma.user.findUnique({
                where: {id},
                include: {
                    followers: true, // Включает подписчиков пользователя
                    following: true  // Включает пользователей, на которых подписан данный пользователь
                }
            });

            if (!user) {
                // Если пользователь не найден, возвращает статус 400 с сообщением об ошибке
                return res.status(400).json({error: 'Пользователь не найден'});
            }

            // Проверяет, подписан ли аутентифицированный пользователь на пользователя с указанным 'id'
            const isFollow = await prisma.follows.findFirst({
                where: {
                    AND: [
                        {followerId: userId},  // Аутентифицированный пользователь как подписчик
                        {followingId: id}      // Пользователь с указанным 'id' как тот, на кого подписываются
                    ]
                }
            });

            // Возвращает данные пользователя вместе со статусом подписки
            res.json({...user, isFollow: Boolean(isFollow)});
        } catch (error) {
            // Логирует любые возникшие ошибки и возвращает статус 500 с сообщением об ошибке
            console.error("Error in getUserById:", error.message);
            res.status(500).json({error: 'Internal server error'});
        }
    },

    currentUser: async (req, res) => {
        try {
            // Ищем текущего пользователя в базе данных по 'userId' аутентифицированного пользователя
            const user = await prisma.user.findUnique({
                where: {id: req.user.userId},
                include: {
                    followers: {
                        // Включает информацию о подписчиках пользователя
                        include: {
                            follower: true
                        }
                    },
                    following: {
                        // Включает информацию о пользователях, на которых подписан текущий пользователь
                        include: {
                            following: true
                        }
                    }
                }
            });

            // Если пользователь не найден, возвращает статус 400 с сообщением об ошибке
            if (!user) {
                return res.status(400).json({error: 'Пользователь не найден'});
            }

            // Возвращает данные текущего пользователя
            res.json(user);
        } catch (error) {
            // Логирует любые ошибки, возникшие в процессе поиска пользователя
            console.error("Error in currentUser:", error.message);
            // Возвращает статус 500 при возникновении ошибки
            res.status(500).json({error: 'Internal server error'});
        }
    },
}

module.exports = UserController

