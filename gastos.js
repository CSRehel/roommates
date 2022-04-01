const fs = require('fs')
const { v4: uuidv4 } = require('uuid')

//registrar gastos
const guardarGastos = (gasto) => {

    const gastoJSON = JSON.parse(fs.readFileSync('gastos.json', 'utf8'))

    const gastos = JSON.parse(gasto)

    const id = {
        id: uuidv4().slice(30)
    }

    const finalGastos = Object.assign(id, gastos);

    gastoJSON.gastos.push(finalGastos)

    fs.writeFileSync('gastos.json', JSON.stringify((gastoJSON), null, 4))

}

module.exports = { guardarGastos }
