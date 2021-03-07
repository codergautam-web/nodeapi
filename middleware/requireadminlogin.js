const jwt = require('jsonwebtoken');
const db = require('../util/db');
const { JWT_KEYS } = require('../util/keys');

module.exports = (req, res, next) => {
    const { authorization } = req.headers
    if (!authorization) {
        return res.status(400).json({ status: "fail", message: "You must be logged in" })
    }
    const token = authorization.replace("Bearer ", "")
    jwt.verify(token, JWT_KEYS, (err, payload) => {
        if (err) {
            return res.status(400).json({ status: "fail", message: "You must be logged in" })
        }
        const { id } = payload
        console.log(token, id)
        db.execute('SELECT * FROM admin WHERE ad_id = ?', [id])
            .then(([logindata]) => {
                if (!logindata[0]) {
                    return res.status(422).json({ status: "fail", message: "Token expire login again" })
                }
                var info = {
                    id: logindata[0].id,
                    mobile: logindata[0].mobile,
                }
                req.admin = info
                next()
            })
            .catch((err) => {
                console.log(err, 'ral')
            })
    })
}