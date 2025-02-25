#!/usr/bin/env node
const arch = require('./core/arch')
const setup = require('./core/setup')

const server = require('./server')


setup.get_connection().then(client=>
{
    setup.init(setup,
        contracts=>{
            const app = contracts.app
            app.server = server
            contracts.server = server
        })
})
