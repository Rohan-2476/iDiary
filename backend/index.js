const connectToMongo = require('./db');
const express = require('express');

connectToMongo();

const app = express();
const port = 5000;

app.use(express.json()); //Need to use this middleware in case you need to console "req.body".

//Available routes
app.get('/', (req, res) => {
    res.send('Hello Rohan')
})

app.use('/api/auth/', require('./routes/auth'))
app.use('/api/notes', require('./routes/notes'))

app.listen(port, () => {
    console.log(`Example app listening on port http://127.0.0.1:${port}`)
})