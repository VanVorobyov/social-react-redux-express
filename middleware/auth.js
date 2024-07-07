// Импортируем модуль jsonwebtoken для работы с токенами
const jwt = require('jsonwebtoken');

// Определяем middleware функцию для аутентификации
const authenticateToken = (req, res, next) => {

    // Получаем заголовок Authorization из запроса
    const authHeader = req.headers.authorization;

    // Извлекаем токен из заголовка
    const token = authHeader && authHeader.split(' ');

    // Если токен не найден, возвращаем ошибку 401 Unauthorized
    if (token == null) return res.sendStatus(401).json({error: 'Unauthorized'});

    // Верифицируем токен с помощью секретного ключа
    jwt.verify(token, process.env.SECRET_KEY_OF_SOCIAL_NETWORK, (err, user) => {

        // Если ошибка при верификации, возвращаем ошибку 403 Forbidden
        if (err) return res.sendStatus(403).json({error: 'Forbidden'});

        // Если токен верифицирован, добавляем информацию о пользователе к запросу
        req.user = user;

        // Продолжаем обработку запроса
        next();
    });
};

// Экспортируем middleware функцию для использования в других частях приложения
module.exports = {authenticateToken};
