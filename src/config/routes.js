const express = require('express')
const auth = require('./auth')
const BillingCycle = require('../api/billingCycle/billingCycleService')
const authService = require('../api/user/authService')

module.exports = function (server) {

    /* Rotas protegidas por Token JWT */
    const protectedApi = express.Router()
    server.use('/api', protectedApi)

    protectedApi.use(auth) // Filtro de autenticação

   
    BillingCycle.register(protectedApi, '/billingCycles')

    /* Rotas abertas */
    const openApi = express.Router()
    server.use('/oapi', openApi)

   
    openApi.post('/login', authService.login)
    openApi.post('/signup', authService.signup)
    openApi.post('/validateToken', authService.validateToken)
}