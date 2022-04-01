const axios = require('axios')
const { v4: uuidv4 } = require('uuid')
const fs = require('fs')

let gastos = []

//generar nuevo roommate
const nuevoRoommate = async () => {
    try {

        const { data } = await axios.get('https://randomuser.me/api/')
        const roommate = data.results[0]

        const user = {
            id: uuidv4().slice(30),
            correo: roommate.email,
            nombre: `${roommate.name.title} ${roommate.name.first} ${roommate.name.last}`,
            debe: 0,
            recibe: 0
        }

        return user
        
    } catch (e) {
        throw e;
    }
}

//guardar roommate
const guardarRoommate = (roommate) => {

    const roommateJSON = JSON.parse(fs.readFileSync('roommates.json', 'utf8'))

    roommateJSON.roommates.push(roommate)

    fs.writeFileSync('roommates.json', JSON.stringify((roommateJSON), null, 5))

}

const actualizarValores = (gasto, operator) => {

    const roommates = JSON.parse(fs.readFileSync('roommates.json', 'utf8')) //lista de roommates
    const gastosJSON = JSON.parse(fs.readFileSync('gastos.json', 'utf8')) //lista de gastos - historial

    gastos.push(JSON.parse(gasto)) // array del gasto registrado

    let dinero = JSON.parse(gasto).monto // monto del gasto registrado

    let roommie = gastos[0].roommate // nombre del roommate registrado en el historial de gastos


    // obtiene el indice del archivo json del roommate seleccionado
    let index 

    for (let i = 0; i < roommates.roommates.length; i++) {
        if (roommates.roommates[i].nombre == roommie) {
            index = i // obtiene el indice
        }
    }

    //según acción se modifican los valores de debe y recibe
    switch(operator){
        case 'gastoPOST':

            for (let i of gastos){
                if (i.roommate == roommates.roommates[index].nombre){
        
                    roommates.roommates[index].debe += dinero
                    break;
        
                }
            }

            break;

        case 'gastoPUT':

            const nuevoGasto = JSON.parse(gasto)

            let ultMonto

            for (let i of gastosJSON.gastos){
                
                if (i.roommate == nuevoGasto.roommate){
                
                    ultMonto = i.monto
                    break;

                }
            }
            
            for (let i of gastosJSON.gastos){
                
                if (i.roommate == nuevoGasto.roommate){
                    
                    i.descripcion = nuevoGasto.descripcion;
                    i.monto = nuevoGasto.monto;
                    
                    if(dinero < ultMonto){

                        roommates.roommates[index].debe -= (ultMonto - dinero)

                    }else{
                        roommates.roommates[index].debe += (dinero - ultMonto)
                    }

                    break;

                }
            }

            break;
    }

    fs.writeFileSync("gastos.json", JSON.stringify(gastosJSON, null, " "));
    fs.writeFileSync('roommates.json', JSON.stringify((roommates), null, 5))
    

    gastos = []

}

module.exports = { nuevoRoommate, guardarRoommate, actualizarValores }