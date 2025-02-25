#!/usr/bin/env node
const fs            = require('fs')
const { Client }    = require('pg');
const arch = require('./arch')
function app_dir()
{
    return __dirname+"/../"
}
function get_env()
{
    const env = {}
    fs.readFileSync('.env').toString().split('\n').map(line=>line.match('=')?env[line.split('=')[0].trim()] = line.split('=')[1].trim():'')
    return env
}
function get_connection(cb=()=>{})
{
    const env       = get_env()
    const host      = env.DB_HOST
    const user      = env.DB_USER
    const password  = env.DB_PASS
    const database  = env.DB_NAME
    const port      = env.DB_PORT
    const client    = new Client({ user, host, database, password, port });
    return new Promise(
        ((resolve,reject)=>{
            client.connect()
            .then(
                () => { 
                    resolve(client)
                    if(typeof cb === 'function') cb(client)
                }
            ) .catch(
                (err) => 
                {
                    reject(err)
                }
            );
        })
    )
}
function run_query(query,cb=()=>{})
{
    return new Promise(
        ((resolve,reject)=>{
            get_connection().then(
                client=>{
                    if(query)
                    {

                        client.query(query,(e,data)=>{
                            if(data)
                            {
                                resolve(data.rows)
                                if(typeof cb === 'function') cb(data.rows)
                            }
                            if(e)
                            {
                                reject(e.stack)
                            }
                        })
                    }
                    else{
                        console.info('no query',query)
                    }
                }
            )
        })
    )
}
function _run_query(query,cb=()=>{})
{
    return new Promise(
        ((resolve,reject)=>{
            get_connection().then(
                client=>{
                    if(query)
                    {

                        client.query(query,(e,data)=>{
                            if(data)
                            {
                                resolve(data.rows)
                                if(typeof cb === 'function') cb(data.rows)
                            }
                            if(e)
                            {
                                reject(e.stack)
                            }
                        })
                    }
                    else{
                        console.info('no query',query)
                    }
                }
            )
        })
    )
}

function get_db_tables(cb=()=>{})
{
    run_query('SELECT table_name FROM information_schema.tables WHERE table_schema = \'public\'',cb)
}

function create_db_tables(cb=()=>{})
{
    console.info('creating tables');
    run_query(fs.readFileSync(app_dir()+'/structure/tables.sql').toString(),cb)
}
function contracts(setup)
{
    const contracts_manager = new arch.Contracts(setup)
    return contracts_manager
}

function seed(_app)
{
    let seeder = require('./seeding')
    seeder.seed(_app)
}
function init(setup,cb=()=>{})
{
    const _app = contracts(setup)
    console.log('init...')
    get_db_tables(
        tables=>{
            if(tables.length == 0 || (tables.find(t=>t.table_name=='setup') == null))
            {
                create_db_tables(results=>{
                    get_db_tables(tables=>{})
                    seed(_app)
                    if(typeof cb === 'function') cb(_app)
                })
            }
            else
            {
                seed(_app)
                if(typeof cb === 'function') cb(_app)
            }
        }
    )
}
const setup = { get_env, get_connection , init, run_query, _run_query}
module.exports = setup