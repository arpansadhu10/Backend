const nodemailer = require('nodemailer')

exports.mailSender = async (option) => {

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        }
    })
    const message = {
        from: 'GlobalAuth solutions pvt. ltd', // sender address
        to: option.email, // list of receivers
        subject: option.subject, // Subject line
        text: option.message, // plain text body
        // html: "<b>Hello world?</b>", // html body
    }
    console.log(message);

    // send mail with defined transport object
    let info = await transporter.sendMail(message);

}