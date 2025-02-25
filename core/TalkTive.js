#!/usr/bin/env node
const {guessModel} = require('./utils')

Query = class Query
{
    query = ""
    _table = ""
    _columns = ""
    _where = ""
    _orderBy = ""
    from(table)
    {
        this._table = table
        return this
    }
    select(columns)
    {
        this._columns = (this._columns ? this._columns + "," : "") + columns 
        return this
    }
    all()
    {
        this._columns = "*"
        return this
    }
    find(id)
    {
        this.where("id",id)
        return this
    }
    search(column,value)
    {
        this.where(column,value)
        return this
    }
    where(column,arg1=null,arg2=null)
    {
        let operator = arg1
        let value = arg2
        if(!(arg1 && arg2))
        {
            if(arg1){
                value = arg1
                operator = "="
            }
            else
            {
                operator = "="
            }
        }
        value = ((typeof value) === 'string') ? "'"+value.trim()+"'" : value
        this._where = this._where + (this._where ? " AND " : " WHERE ") + `${column} ${operator} ${value}`
        return this
    }
    orderBy(column, order)
    {
        this._orderBy = ` ORDER BY ${column} ${order}`
        return this
    }
    toSql()
    {
        this.query = `SELECT ${this._columns} FROM ${this._table} ${this._where} ${this._orderBy}`
        return this.query
    }
    
    async run(cb)
    {
        let results = await this.setup._run_query(this.toSql(),cb)
        const Model   = guessModel(this._table)
        if(Model)
        {
            results = results.map(
                result_obj=>{
                    let result = new Model(this.contracts)
                    Object.keys(result_obj).map(
                        key=>result[key] = result_obj[key]
                    )
                    return result
                }
            )
        }
        return results
    }
    constructor(app)
    {
        this.contracts = app.contracts
        this.setup = app.setup
    }
}

module.exports = {Query}