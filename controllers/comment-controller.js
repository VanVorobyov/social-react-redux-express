// Импортируем экземпляр Prisma клиента
const {prisma} = require("../prisma/prisma-client");

const CommentController = {
    // Метод для создания комментария
    createComment: async (req, res) => {
        // Извлекаем postId и content из тела запроса
        const {postId, content} = req.body;
        // Получаем userId из аутентифицированного пользователя в запросе
        const userId = req.user.userId;

        // Проверяем, предоставлены ли postId и content
        if (!postId || !content) {
            // Если нет, возвращаем статус 400 с сообщением об ошибке
            return res.status(400).json({error: 'Все поля обязательные для заполнения'});
        }

        try {
            // Пытаемся создать новый комментарий в базе данных
            const comment = await prisma.comment.create({
                data: {
                    postId,
                    content,
                    userId
                }
            });

            // Отправляем созданный комментарий в ответе
            res.json(comment);
        } catch (error) {
            // Логируем сообщение об ошибке в консоль
            console.error("Ошибка: ", error.message);
            // Возвращаем статус 500 с сообщением об ошибке
            res.status(500).json({error: 'Не удалось создать комментарий'});
        }
    },

    // Метод для удаления комментария
    deleteComment: async (req, res) => {
        try {
            // Извлекаем ID комментария из параметров запроса
            const {id} = req.params;
            // Получаем userId из аутентифицированного пользователя в запросе
            const userId = req.user.userId;

            // Находим комментарий в базе данных по его ID
            const comment = await prisma.comment.findUnique({where: {id}});

            // Проверяем, существует ли комментарий
            if (!comment) {
                // Если нет, возвращаем статус 404 с сообщением об ошибке
                return res.status(404).json({error: 'Комментарий не найден'});
            }

            // Проверяем, принадлежит ли комментарий аутентифицированному пользователю
            if (comment.userId !== userId) {
                // Если нет, возвращаем статус 403 с сообщением об ошибке
                return res.status(403).json({error: 'Нет доступа'});
            }

            // Удаляем комментарий из базы данных
            await prisma.comment.delete({where: {id}});

            // Отправляем удалённый комментарий в ответе
            res.json(comment);
        } catch (error) {
            // Логируем сообщение об ошибке в консоль
            console.error("Ошибка: ", error.message);
            // Возвращаем статус 500 с сообщением об ошибке
            res.status(500).json({error: 'Не удалось удалить комментарий'});
        }
    }
}

// Экспортируем модуль CommentController
module.exports = CommentController;
