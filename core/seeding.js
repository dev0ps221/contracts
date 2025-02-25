#!/usr/bin/env node
const {run_query} = require('./setup')
const arch = require('./arch')
const permission_list = ['contracts','groups','intervenants','goals','facts','roles','permissions']
const role_list = [['admin',permission_list],['intervenant',['goals','facts']]]
function seed(_app)
{
    permissions(_app)
    roles(_app)
    base_users(_app)
    console.info('database seeded..')
}
async function base_users(_app)
{
    let intervenants = await (new arch.Models.Intervenant(_app)).where('name','ADMIN').run()
    let intervenant = intervenants[0]
    if(!intervenant)
    {
        intervenant = new arch.Models.Intervenant(_app)
    }
    intervenant.name = 'ADMIN'
    intervenant.password = _app.Encrypt('adminpassword')
    intervenant.email = 'admin@contracts.tek-tech.net'
    intervenant.login = 'admin'
    
    intervenant.save().then(async results=>{
        if(results)
        {
            intervenant = results
            const role = await (new arch.Models.Role(_app)).find(1)
            adminroles = await (new arch.Models.IntervenantRole(_app)).where('intervenant_id',intervenant.id).where('role_id',role.id).run()
            adminrole = adminroles[0]
            if(!adminrole)
            {
                adminrole = new arch.Models.IntervenantRole(_app)
            }
            adminrole.role_id = role.id
            adminrole.intervenant_id = intervenant.id
            adminrole.save()
        }
    })
}

async function  seed_permission(_app,permission_data) {
    let permissions = await (new arch.Models.Permission(_app)).where('name',permission_data).run()
    let permission = permissions[0]
    if(!permission)
    {
        permission = new arch.Models.Permission(_app)
    }
    permission.name = permission_data
    let results = await permission.save()
    
}

async function  seed_role(_app,role_data) {
    let roles = await (new arch.Models.Role(_app)).where('name',role_data[0]).run()
    let role = roles[0]
    if(!role)
    {
        role = new arch.Models.Role(_app)
    }
    role.name = role_data[0]
    let results = await role.save()
    if(results)
    {
        role = results
        if(role_data[1] && role_data[1].length)
        {
            role_data[1].map(
                async role_permission=>{
                    let permissions = await (new arch.Models.Permission(_app)).where('name',role_permission).run()
                    let permission = permissions[0]
                    if(permission)
                    {
                        let rps = await (new arch.Models.RolePermission(_app)).where('role_id',role.id).where('permission_id',permission.id).run()
                        let rp  = rps[0]
                        if(!rp)
                        {
                            rp = new arch.Models.RolePermission(_app)
                        }
                        rp.permission_id = permission.id
                        rp.role_id = role.id
                        rp.save()
                    }
                }
            )
        }
    }
}
function permissions(_app)
{
    permission_list.forEach(
        async (data)=>await seed_permission(_app,data)
    )
}

function roles(_app)
{
    role_list.forEach(
        async (data)=>await seed_role(_app,data)
    )
}
module.exports = {seed}