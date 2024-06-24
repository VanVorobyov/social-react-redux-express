const UserController = {
    register: async (req, res) => {
        res.send('register');
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

