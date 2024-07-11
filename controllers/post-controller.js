const {prisma} = require('../prisma/prisma-client');


const PostController = {

    createPost: async (req, res) => {
        // Извлекаем содержание поста из тела запроса
        const {content} = req.body;
        // Получаем ID автора из пользовательских данных в запросе
        const authorId = req.user.userId;

        // Проверяем, заполнено ли содержание поста
        if (!content) {
            // Если нет, возвращаем ответ с ошибкой и статусом 400
            return res.status(400).json({error: 'Все поля обязательные для заполнения'});
        }

        try {
            // Пытаемся создать новый пост в базе данных с помощью Prisma
            const post = await prisma.post.create({
                data: {
                    content,
                    authorId
                }
            });
            // Возвращаем созданный пост в ответе
            res.json(post);
        } catch (error) {
            // Логируем ошибку в консоль
            console.error("Error in CREATE POST ", error.message);
            // Возвращаем ответ с ошибкой и статусом 500
            res.status(500).json({error: 'Не удалось создать пост'});
        }
    },

    getAllPosts: async (req, res) => {
        res.send('getAll');
    },
    getPostById: async (req, res) => {
        res.send('getPostById');
    },
    updatePost: async (req, res) => {
        res.send('update');
    },
    deletePost: async (req, res) => {
        res.send('delete');
    },

}

module.exports = PostController
