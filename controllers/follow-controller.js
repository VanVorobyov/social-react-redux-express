const {prisma} = require("../prisma/prisma-client");

const FollowController = {
    followUser: async (req, res) => {
        try {
            // Извлекаем followingId из тела запроса (тот на кого хотим подписаться)
            const {followingId} = req.body;
            // Получаем userId из аутентифицированного пользователя в запросе
            const userId = req.user.userId;

            // Проверяем, предоставлен ли followingId
            if (!followingId) {
                // Если нет, возвращаем статус 400 с сообщением об ошибке
                return res.status(400).json({error: 'Все поля обязательные для заполнения'});
            }

            // Проверяем, пытается ли пользователь подписаться на себя
            if (followingId === userId) {
                // Если да, возвращаем статус 500 с сообщением об ошибке
                return res.status(500).json({error: 'Нельзя подписаться на себя'});
            }

            // Проверяем, существует ли уже подписка
            const existingSubscription = await prisma.follows.findFirst({
                where: {
                    AND: [
                        {followerId: userId},
                        {followingId}
                    ]
                }
            });

            // Если подписка существует, возвращаем статус 400 с сообщением об ошибке
            if (existingSubscription) {
                return res.status(400).json({error: 'Вы уже подписаны на этого пользователя'});
            }

            // Создаём новую подписку в базе данных
            await prisma.follows.create({
                data: {
                    follower: {connect: {id: userId}},
                    following: {connect: {id: followingId}},
                },
            });

            // Отправляем статус 201 с сообщением об успешной подписке
            res.status(201).json({message: 'Подписка успешно создана'});
        } catch (error) {
            // Логируем сообщение об ошибке в консоль
            console.error("Ошибка: ", error.message);
            // Возвращаем статус 500 с сообщением об ошибке
            res.status(500).json({error: 'Не удалось подписаться'});
        }
    },

    unfollowUser: async (req, res) => {
        // Извлекаем followingId из тела запроса (тот от кого хотим отписаться)
        const {followingId} = req.body;
        // Получаем userId из аутентифицированного пользователя в запросе
        const userId = req.user.userId;

        // Проверяем, предоставлен ли followingId
        if (!followingId) {
            // Если нет, возвращаем статус 400 с сообщением об ошибке
            return res.status(400).json({error: 'Все поля обязательные для заполнения'});
        }

        try {
            // Находим подписку в базе данных по followerId и followingId
            const follows = await prisma.follows.findFirst({
                where: {
                    AND: [{followerId: userId}, {followingId}]
                },
            });

            // Если подписка не найдена, возвращаем статус 400 с сообщением об ошибке
            if (!follows) {
                return res.status(400).json({error: 'Вы не подписаны на этого пользователя'});
            }

            // Удаляем подписку из базы данных
            await prisma.follows.delete({
                where: {id: follows.id},
            });

            // Отправляем статус 200 с сообщением об успешной отписке
            res.status(200).json({message: 'Отписка успешно выполнена'});
        } catch (error) {
            // Логируем сообщение об ошибке в консоль
            console.error("Ошибка: ", error.message);
            // Возвращаем статус 500 с сообщением об ошибке
            res.status(500).json({error: 'Не удалось отписаться'});
        }
    },
}

module.exports = FollowController;
