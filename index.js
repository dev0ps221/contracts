#!/usr/bin/env node

const { join } = require('node:path');
const { Router } = require('./web/routing');

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

            app.server.io.on('connection', (socket) => {
                console.log('a user connected');
                socket.on('login',async (data)=>{
                    const {email,password} = data
                    if(email && password)
                    {
                        const user = await new arch.Models.Intervenant(app.contracts).where('email',email).where('password',app.contracts.Encrypt(password)).run()
                        if(user.length)
                        {
                            socket.emit('loginresponse',{data:user[0].modelObject()})
                        }
                    }else{
                        socket.emit('loginresponse',"Veuillez renseigner tous les champs")
                    }
                })
            });
            app.server.server.listen(3000, () => {
                console.log('server running at http://localhost:3000');
                const router = new Router(app.server.app)
                router.get_view('/','index.html')
                router.get_page('/page/:name')
            });





        })
})
