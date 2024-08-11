const {prisma} = require('../prisma/prisma-client');

const LikeController = {
  // Метод для постановки лайка на пост
  likePost: async (req, res) => {
    const {postId} = req.body; // Извлечение postId из параметров запроса
    const userId = req.user.userId; // Извлечение userId из аутентифицированного пользователя
    
    // Проверка, указан ли postId
    if (!postId) {
      return res.status(400).
      json({error: 'Все поля обязательные для заполнения'}); // Возвращение ошибки, если postId отсутствует
    }
    
    try {
      // Проверка, ставил ли пользователь уже лайк на этот пост
      const existingLike = await prisma.like.findFirst({
        where: {
          postId,
          userId,
        },
      });
      
      // Если лайк уже существует, возвращаем ошибку
      if (existingLike) {
        return res.status(400).json({error: 'Вы уже поставили лайк'});
      }
      
      // Создание новой записи лайка в базе данных
      const like = await prisma.like.create({
        data: {
          postId,
          userId,
        },
      });
      
      // Возвращение созданного объекта лайка
      res.json(like);
    }
    catch (error) {
      console.error('Ошибка в LIKE POST', error.message); // Логирование сообщения об ошибке
      res.status(500).json({error: 'Внутренняя ошибка сервера'}); // Возвращение ответа об ошибке сервера
    }
  },
  
  // Метод для удаления лайка (дизлайка) с поста
  dislikePost: async (req, res) => {
    const {id} = req.params; // Извлечение postId из параметров запроса
    const userId = req.user.userId; // Извлечение userId из аутентифицированного пользователя
    
    // Проверка, указан ли id (postId)
    if (!id) {
      return res.status(400).json({error: 'Вы уже поставили дизлайк'}); // Возвращение ошибки, если postId отсутствует
    }
    
    try {
      // Проверка, существует ли лайк для данного поста и пользователя
      const existingLike = await prisma.like.findFirst({
        where: {
          postId: id,
          userId,
        },
      });
      
      // Если лайк не существует, возвращаем ошибку
      if (!existingLike) {
        return res.status(400).json({error: 'Вы уже поставили дизлайк'});
      }
      
      // Удаление записи лайка из базы данных
      const dislike = await prisma.like.deleteMany({
        where: {
          postId: id,
          userId,
        },
      });
      
      // Возвращение результата операции удаления
      res.json(dislike);
    }
    catch (error) {
      console.error('Ошибка в DISLIKE POST', error.message); // Логирование сообщения об ошибке
      res.status(500).json({error: 'Внутренняя ошибка сервера'}); // Возвращение ответа об ошибке сервера
    }
  },
};

module.exports = LikeController;
