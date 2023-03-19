const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

module.exports.connect = async () => {
    mongoose.connect(process.env.DATABASE_URL_TEST, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
    }).then(() => console.log('MongoDB test connected...'));
}

module.exports.close = async () => {
    await mongoose.connection.close();
}

module.exports.clear = async () => {
    const collections = mongoose.connection.collections;
    for(const key in collections) {
        const collection = collections[key];
        await collection.deleteMany();
    }
}