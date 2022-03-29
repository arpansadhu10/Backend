const mongoose = require('mongoose');

const database_url = process.env.DATABASE_URL

exports.connect = () => {
    mongoose.connect(database_url, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
        .then(() => {
            console.log("DB CONNECTED successfully");
        })
        .catch((err) => {
            console.log(err);
            console.log("connection failed");
            process.exit(1);
        })
}