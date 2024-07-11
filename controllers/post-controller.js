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
        // Получаем ID пользователя из данных запроса
        const userId = req.user.userId;

        try {
            // Ищем все посты в базе данных с использованием Prisma
            const posts = await prisma.post.findMany({
                // Включаем данные об авторе, лайках и комментариях для каждого поста
                include: {
                    author: true,
                    likes: true,
                    comments: true
                },
                // Сортируем посты по дате создания в порядке убывания
                orderBy: {
                    createdAt: 'desc'
                },
            });

            // Добавляем информацию о том, поставил ли текущий пользователь лайк на каждый пост
            const postWithLikeInfo = posts.map(post => ({
                ...post,
                likedByUser: post.likes.some(
                    (like) => like.userId === userId
                )
            }));

            // Возвращаем посты с дополнительной информацией о лайках в ответе
            res.json(postWithLikeInfo);

        } catch (error) {
            // Логируем ошибку в консоль
            console.error("Ошибка: ", error.message);
            // Возвращаем ответ с ошибкой и статусом 500
            res.status(500).json({error: 'Не удалось получить посты'});
        }
    },

    getPostById: async (req, res) => {
        // Извлекаем параметр 'id' из URL запроса => :id
        const {id} = req.params;
        // Извлекаем 'userId' из информации аутентифицированного пользователя
        const userId = req.user.userId;

        try {
            // Ищем пост в базе данных с использованием Prisma
            const post = await prisma.post.findUnique({
                // Указываем условие поиска по ID
                where: {id},
                // Включаем данные об авторе, лайках и комментариях для поста
                include: {
                    author: true,
                    likes: true,
                    comments: {
                        include: {
                            user: true,
                        }
                    },
                },
            });

            // Если пост не найден, возвращаем ответ с ошибкой и статусом 400
            if (!post) {
                return res.status(404).json({error: 'Пост не найден'});
            }

            // Добавляем информацию о том, поставил ли текущий пользователь лайк на пост
            const postWithLikeInfo = {
                ...post,
                likedByUser: post.likes.some(
                    (like) => like.userId === userId
                )
            };

            // Возвращаем пост с дополнительной информацией о лайках в ответе
            res.json(postWithLikeInfo);

        } catch (error) {
            // Логируем ошибку в консоль
            console.error("Error in getPostById", error.message);
            // Возвращаем ответ с ошибкой и статусом 500
            res.status(500).json({error: 'Не удалось получить пост'});
        }
    },


    // Асинхронный метод для удаления поста
    deletePost: async (req, res) => {
        // Извлекаем параметр 'id' из URL запроса => :id
        const {id} = req.params;
        // Извлекаем 'userId' из информации аутентифицированного пользователя
        const userId = req.user.userId;

        // Ищем пост в базе данных с использованием Prisma
        const post = await prisma.post.findUnique({
            where: {
                id,
            }
        });

        // Если пост не найден, возвращаем ответ с ошибкой и статусом 404
        if (!post) {
            return res.status(404).json({error: 'Пост не найден'});
        }

        // Если пользователь не является автором поста, возвращаем ответ с ошибкой и статусом 403
        if (post.authorId !== userId) {
            return res.status(403).json({error: 'Нет доступа'});
        }

        try {
            // Удаляем пост и связанные данные в одной транзакции с использованием Prisma
            const transaction = await prisma.$transaction([
                // Удаляем все комментарии, связанные с постом
                prisma.comment.deleteMany({
                    where: {
                        postId: id
                    }
                }),
                // Удаляем все лайки, связанные с постом
                prisma.like.deleteMany({
                    where: {
                        postId: id
                    }
                }),
                // Удаляем сам пост
                prisma.post.delete({
                    where: {
                        id
                    }
                })
            ]);
            // Возвращаем результат транзакции в ответе
            res.json(transaction);
        } catch (error) {
            // Логируем ошибку в консоль
            console.error("Error in DELETE POST ", error.message);
            // Возвращаем ответ с ошибкой и статусом 500
            res.status(500).json({error: 'Internal server error'});
        }
    },


}

module.exports = PostController
