const db = require('../../data/dbConfig')
const bcrypt = require('bcryptjs')

module.exports = async (req, res, next) => {
    const user = await db('users').where('username', req.body.username)

    if (!req.body.username || !req.body.password) {
        res
            .status(401)
            .json({ message: 'username and password required'})
    } else if( user.length === 0 || !bcrypt.compareSync(req.body.password, user[0].password)) {
        res
            .status(401)
            .json({ message: 'Invalid credentials'})
    } else {
        next()
    }
}