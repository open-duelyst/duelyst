const path = require('path')
const crypto = require('crypto')
const Promise = require('bluebird')
require('coffee-script/register')
require('app-module-path').addPath(path.join(__dirname, '../'))
const config = require('config/config')
const expect = require('chai').expect
const Steam = require('server/lib/steam')

const bnea = require('server/lib/bnea')({
    apiUrl: config.get('bnea.apiUrl'),
    appId: config.get('bnea.serverAppId'),
    appSecret: config.get('bnea.serverAppSecret')
})

// have to update
const ticket = "14000000EAA4E35AE6A4EF9E88D38A0001001001A65C5E5918000000010000000200000086F3CA490000000057A34C04A7000000B2000000320000000400000088D38A00010010015272040086F3CA495201A8C0000000000A7451598A236D590100A39F000000000000164F972A30B5C70D9949F702A3ECBBACE06681DCC8CA7C1C297CBFB2EAB6DDC52D7023132BBE74305D79308CF2E4141D6327E6E7FE4FAD02074ECCDA4F2ADF3ADF7A50B114C84791E23B87105CA1F040E551DB0FD3F3F708E0714329EC77CED80C8B124E081AFD391C4B93601D32024FE5FF3320A2FCBD5E0F491F2899A6D0E4"
const bneaLogin = {
    email: 'marwan+s7@counterplay.co',
    password: 'Password1!'
}
let bneaToken = null

function dataLogger(res) {
    console.log(`[Status ${res.status}] ${res.body.status}`)
    console.log(res.body.data)
    return res
}

function errorLogger(e) {
    console.log(`[Status ${e.status}] ${e.innerMessage}: ${e.codeMessage}`)
    throw e
}


function removeLink() {
    return Promise.resolve(bnea.login(bneaLogin))
    .then(res => {
        bneaToken = res.body.data.access_token
        return Promise.all([
            bnea.getUserId(bneaToken),
            bnea.accountInfo(bneaToken),
            Steam.authenticateUserTicket(ticket)
        ])
    })
    .spread((bneaId,info,steamId) => {
        let data = {
            account_id: parseInt(bneaId), 
            steam_id: steamId
        }
        console.log(info.body.data)
        return bnea.steamUnlink(bneaToken, data)
    })
    .then(dataLogger)
    .catch(errorLogger)
}

function createLink() {
    return Steam.authenticateUserTicket(ticket)
    .then(steamId => {
        console.log(steamId)
        return bnea.steamLink({
            email: bneaLogin.email,
            password: bneaLogin.password,
            steam_id: steamId,
            steam_session_ticket: ticket,
            steam_appid: parseInt(config.get('steam.appId'))
        })
    })
    .then(dataLogger)
    .catch(errorLogger)
}

removeLink()
// createLink()