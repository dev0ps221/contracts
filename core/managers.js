#!/usr/bin/env node
const {Query} = require('./TalkTive')

class DataInterface
{
    query() 
    {
        return new Query(this.app)
    }
    search(table,column,value,cb=()=>{})
    {
        const query = this.query()
        query.search(column,value)
        query.from(table)
        query.all()
        query.run(cb)
    }
    find(table,id,cb=()=>{})
    {
        const query = this.query()
        query.find(id)
        query.from(table)
        query.all()
        query.run(cb)
    }
    insertInto(tableName,dataObject,cb=()=>{})
    {

        this.app.setup.get_connection().then(
            client=>{
                
                const keys = Object.keys(dataObject).map(
                    key=>{
                    return key  
                    }
                ).join(',')
                const values = Object.keys(dataObject).map(
                    key=>{
                    return dataObject[key]
                    }
                ).join(',')
                let query = `INSERT INTO ${tableName} (${keys}) VALUES (${values}) RETURNING *;`;
                client.query(query)
                .then(res => {
                    const results = res.rows.length > 0 ? res.rows[0] : null
                    if(typeof cb === 'function') cb(results)
                })
                .catch((e)=>console.error(e,' => ',query))
                ;
            }
        )
    }
    update(tableName,dataObject,cb=()=>{})
    {

        this.app.setup.get_connection().then(
            client=>{
                
                const keys = Object.keys(dataObject).map(
                    key=>{
                    return `${key} = ${dataObject[key]}`
                    }
                ).join(',')
                let query = `UPDATE ${tableName} SET ${keys} WHERE id = ${dataObject.id} RETURNING *;`;
                client.query(query)
                .then(res => {
                    const results = res.rows.length > 0 ? res.rows[0] : null
                    if(typeof cb === 'function') cb(results)
                })
                .catch((e)=>console.error(e,' => ',query))
                ;
            }
        )
    }
    constructor(app)
    {
        this.app = app
    }
}

class App{
    constructor(contracts)
    {
        this.contracts = contracts
        this.setup = contracts.setup
        this.database = new DataInterface(this,contracts.client)
    }
}

module.exports = {App}