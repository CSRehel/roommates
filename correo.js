const nodemailer = require('nodemailer')

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'desafiolatamadl@gmail.com', //cambiar correo para que funcione
        pass: 'desafiolatam.'
    },
})

const send = async(roommates, gastos, correos) => {
    let mailOptions = {
        from: 'desafiolatamadl@gmail.com',
        to: ['tuCorreo@gmail.com'].concat(correos),
        subject: 'Nuevo gasto registrado',
        html: `Estimado ${roommates[0].nombre}: <h6>Se ha agregado un nuevo gasto a su nombre: </h6><br>
        ${gastos[0].descripcion}: $${gastos[0].monto} <br><br> <small><b>No responder a este correo</b></small>`
    }

    try {
        const result = await transporter.sendMail(mailOptions)
    } catch (e) {
        throw e
    }
}

// send('ganador de prueba', [], 'premio de prueba')

module.exports = { send }