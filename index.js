const http = require('http')
const URL = require('url')
const fs = require('fs')
const { nuevoRoommate, guardarRoommate, actualizarValores } = require('./roommates')
const { guardarGastos } = require('./gastos')
const { send } = require('./correo')

let operator

http.createServer(function(req, res){

    const url = req.url
    let { id } = URL.parse(url, true).query

    // devuelve el documento HTML
    if (url == '/' && req.method == 'GET') {

        res.setHeader('Content-Type', 'text/html')
        res.end(fs.readFileSync('index.html', 'utf8'))
        
    }

    // agrega un roommate random
    if (url.startsWith('/roommate') && req.method == 'POST') {

        nuevoRoommate().then( async (roommate) => {

            guardarRoommate(roommate)
            res.end(JSON.stringify(roommate))

        }).catch(e => {
            res.statusCode = 500
            res.end()
            console.log('Error en el registro de roommate random ', e);
        })

    }

    // muestra los roommates registrados
    if (url.startsWith('/roommates') && req.method == 'GET') {

        const roommates = fs.readFileSync('roommates.json', 'utf8')
        res.setHeader('Content-Type', 'application/json')
        res.end(roommates)

    }

    // agrega gastos
    if (url.startsWith('/gasto') && req.method == 'POST') {

        let body = ''
        operator = 'gastoPOST'

        req.on('data', (chunk) => {
            body = chunk.toString()
        })

        req.on('end', () => {

            guardarGastos(body)
            actualizarValores(body, operator)

            // correos masivos

            const roommates = JSON.parse(fs.readFileSync('roommates.json', 'utf8')).roommates
            const gastos = JSON.parse(fs.readFileSync('gastos.json', 'utf8')).gastos

            const correos = roommates.map((r) => r.correo)

            send(roommates, gastos, correos).then(() => {
                res.end(JSON.stringify(body))
            }).catch(e => {
                res.statusCode = 500
                res.end()
                console.log('Error en el envio de correos electrónicos ', e);
            })

            res.end(body)

        })

    }    

    // muestra los gastos registrados
    if (url.startsWith('/gastos') && req.method == 'GET') {

        res.setHeader('Content-Type', 'application/json')
        res.end(fs.readFileSync('gastos.json', 'utf8'))

    }

    // edita el registro del gasto seleccionado
    if (url.startsWith('/gasto') && req.method == 'PUT') {
        
        let body = ''
        operator = 'gastoPUT'
        
        req.on('data', (chunk) => {
            body = chunk.toString()
        })
        
        req.on('end', () => {

            actualizarValores(body, operator)
            res.end("gasto editado con exito");
    
        })
    
    }

    //elimina el registro de gasto seleccionado
    if (url.startsWith('/gasto') && req.method == 'DELETE') {
        
        let body;
        
        req.on("data", (id) => {
            body = JSON.parse(id);
        });
        
        req.on("end", () => {
            
            let gastosJSON = JSON.parse(fs.readFileSync('gastos.json', 'utf8'))
            const roommates = JSON.parse(fs.readFileSync('roommates.json', 'utf8'))

            const GastoDelete = gastosJSON.gastos.filter((g) => g.id == id);

            let roommie = GastoDelete[0].roommate
            let dinero = GastoDelete[0].monto
            let index 

            const filtroGasto = gastosJSON.gastos.filter((g) => g.id !== id);

            for (let i = gastosJSON.gastos.length; i > 0; i--) {
                gastosJSON.gastos.pop()
            }

            for (let i = 0; i < filtroGasto.length; i++) {
                gastosJSON.gastos.push(filtroGasto[i])
            }

            for (let i = 0; i < roommates.roommates.length; i++) {
                if (roommates.roommates[i].nombre == roommie) {
                    index = i
                }
            }

            for (let i of GastoDelete){
                if (i.roommate == roommates.roommates[index].nombre){

                    roommates.roommates[index].recibe += dinero
                    roommates.roommates[index].debe -= dinero
                    break;
        
                }
            }

            fs.writeFileSync('roommates.json', JSON.stringify((roommates), null, 5))
            fs.writeFileSync("gastos.json", JSON.stringify(gastosJSON, null, " "));

            res.end();
            
        });

    }

}).listen(3000, console.log('Server on'))