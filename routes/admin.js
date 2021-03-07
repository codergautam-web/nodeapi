const express = require('express')
const router = express.Router()
const bodyParser = require('body-parser')
const db = require('../util/db')
const slug = require('slug')
const requireadminlogin = require('../middleware/requireadminlogin')


//DASHBOARD COUNT DATA
router.get('/dashboard-count', (req, res) => {
    db.execute('SELECT * FROM service')
        .then(([servicelist]) => {
            var countservice = servicelist.length

            db.execute('SELECT * FROM admin')
                .then(([adminlist]) => {
                    var countadmin = adminlist.length
                    info = {
                        service: countservice,
                        admin: countadmin
                    }
                    res.json(info);
                })
        })
        .catch((err) => {
            console.log('Error in Count Service', err)
        })
})

//DASHBOARD COUNT DATA 2nd WAY
router.get('/dashboard-count2', (req, res) => {
    db.execute('SELECT * FROM service')
        .then(async ([servicelist]) => {
            var countservice = servicelist.length

            const adminlist = await db.execute('SELECT * FROM admin')
            var countadmin = adminlist[0].length
            // const userlist = await db.execute('SELECT * FROM user')
            // var countuser = userlist[0].length
            info = {
                service: countservice,
                admin: countadmin
            }
            res.json(info);
        })
        .catch((err) => {
            console.log('Error in Count Service', err)
        })
})

//SERVICE LIST
router.get('/service-list', requireadminlogin, (req, res) => {
    var id = req.admin.id
    db.execute('SELECT * FROM service ORDER BY id DESC')
        .then(([datalist]) => {
            if (!datalist[0]) {
                return res.json({ status: "fail", message: "No data found in service" })
            }
            res.json(datalist)
        })
        .catch((err) => {
            console.log('Error in calling service table', err)
        })
})

//INSERT SERVICE
router.post('/add-service', requireadminlogin, (req, res) => {
    var { name, description } = req.body
    // name = toString(name)
    if (!name || !description) {
        return res.json({ status: "fail", message: "Please provice all details" })
    }
    // if (toString(description.length) < 100) {
    //     return res.json({ status: "fail", message: "Please provice description" })
    // }
    // if (toString(name.length) < 3) {
    //     return res.json({ status: "fail", message: "Please provice name" })
    // }
    db.execute('SELECT * FROM service WHERE name = ?', [name])
        .then(async ([datalist]) => {
            if (datalist[0]) {
                return res.json({ status: "fail", message: `Already ${name} available` })
            }
            var slugurl = slug(name)
            const slugdata = await db.query(`SELECT * FROM service WHERE slug LIKE '%${slugurl}%'`)
            var lengthval = slugdata[0].length
            if (lengthval === 0) {
                var newslug = slugurl
            }
            else {
                var lengthval2 = parseInt(lengthval) + parseInt(1)
                var newslug = slugurl + "-" + lengthval2
            }
            db.execute('INSERT INTO service (name, description, slug) VALUES (?, ?, ?)', [name, description, newslug])
                .then(([insertred]) => {
                    res.json({ status: "success", message: `Data inserted successfully` })
                })
                .catch((err) => {
                    console.log('Error in inserting service data', err)
                })
        })
        .catch((err) => {
            console.log('Error in checking exusting data', err)
        })
})

//UPDATE SERVICE
router.post('/update-service', requireadminlogin, (req, res) => {
    var { name, description, id } = req.body
    if (!name || !description || !id) {
        return res.json({ status: 'fail', message: "Please Provide all details" })
    }
    db.execute('UPDATE service SET name = ?, description = ? WHERE id = ?', [name, description, id])
        .then(([updated]) => {
            res.json({ status: 'success', message: 'Service Updated successfully' })
        })
        .catch((err) => {
            console.log('Error in updating service');
        })
})

//DELETE SERVICE
router.get('/delete-service/:id', requireadminlogin, (req, res) => {
    var id = req.params.id
    if (!id) {
        return res.json({ status: "fail", message: "Please Select service to delete" })
    }
    db.execute('SELECT * FROM service WHERE id = ?', [id])
        .then(([servicelist]) => {
            if (!servicelist[0]) {
                return res.json({ status: 'fail', message: "Thie service is not Available" })
            }
            db.execute('DELETE FROM service WHERE id = ?', [id])
                .then(([deleted]) => {
                    res.json({ status: 'success', message: 'Service deleted successfully' })
                })
                .catch((err) => {
                    console.log('Error in deleting service', err);
                })
        })
})

module.exports = router