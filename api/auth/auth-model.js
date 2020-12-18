const db = require('../../data/dbConfig')

module.exports = {
    add(user) {
        return db('users')
                .insert(user)
                .then(([id]) => {
                    return db('users')
                            .where('id', id)
                            .first()
                })
    },
    findByUsername(username) {
        return db('users')
                .where('username', username)
                .first()
    }
}