const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)
const myMail = 'anujmanojchoure@gmail.com'
const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to:email,
        from:myMail,
        subject:'Thankyou for joining in',
        text:`Welcome to the app, ${name}. Let me know how you get along with the app`
    })
}

const sendCancellationEmail = (email, name) => {
    sgMail.send({
        to:email,
        from:myMail,
        subject: 'Your account cancelled successfully',
        text:'Do tell us how was your experience'
    })
}

module.exports = {
    sendWelcomeEmail,
    sendCancellationEmail
}
