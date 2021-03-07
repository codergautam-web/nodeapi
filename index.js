const express = require('express')
const app = express();
const port = 6000;

const authadminRoutes = require('./routes/authadmin')
const adminRoute = require('./routes/admin')

app.use(express.json())

//ADMIN LOGIN ROUTING
app.use('/authadmin', authadminRoutes)
//ADMIN ROUTING
app.use('/admin', adminRoute)

app.get('/', (req, res) => {
    res.send('Hello World!')
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}!`)
});