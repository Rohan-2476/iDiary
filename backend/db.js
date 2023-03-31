const mongoose = require('mongoose');
// const mongoURI = 'mongodb://127.0.0.1:27017';
const mongoURI = 'mongodb://127.0.0.1:27017';
const database = 'idiary'

const connectToMongo = async () => {
    try {
        await mongoose.connect(`${mongoURI}/${database}`);
        console.log('Connected to Mongo Successfully!');
    } catch (err) {
        console.log('Failed to connect to MongoDB', err);
    }
}


module.exports = connectToMongo;