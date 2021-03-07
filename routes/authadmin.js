const express = require('express')
const jwt = require('jsonwebtoken');
const router = express.Router()
const bodyParser = require('body-parser')
const db = require('../util/db')
const { JWT_KEYS } = require('../util/keys')


//ADMIN LOGIN
router.post('/admin-login', (req, res) => {
    var { mobile, password } = req.body
    if (!mobile || !password) {
        return res.json({ status: 'fail', message: 'Please Provide Mobile Number and Password' })
    }
    db.execute('SELECT * FROM admin WHERE mobile = ?', [mobile])
        .then(([datalist]) => {
            if (!datalist[0]) {
                return res.json({ status: "fail", message: "Invalid username or password" })
            }
            if (datalist[0].password === password) {
                var id = datalist[0].ad_id
                const token = jwt.sign({ id: id }, JWT_KEYS)
                return res.json({ status: 'success', message: 'Login Successfull', token: token })
            }
            res.json({ status: "fail", message: "Invalid username or password" })
        })
        .catch((err) => {
            console.log('Error in calling admin table', err)
        })
})
module.exports = router