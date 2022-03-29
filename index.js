const app = require('./app')
const { connect } = require('./config/db')

//db connection
connect();


app.listen(process.env.PORT, () => {
    console.log(`Server is running on PORT ${process.env.PORT}`);
})
