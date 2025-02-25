#!/usr/bin/env node
const {getClass, getClassName, guessTable, guessModel} = require('./utils')
const {Query} = require('./TalkTive')
class Model{
    constructor(contracts)
    {
        this._contracts = contracts
        this._app = contracts.app
        this._database = this._app.database
        this._className = getClassName(this)
        this._class = getClass(this)
        this._table = guessTable(this) 
    }
    modelObject()
    {
        const obj = {}
        Object.keys(this).map(
            key=>{
                if(((typeof this[key]) !== 'function') && this[key] && (key.split("")[0] !== '_')) 
                {
                    obj[key] = (typeof this[key] == 'string') ? "'"+this[key].trim()+"'" : this[key]
                }
            }
        )
        return obj
    }
    query()
    {
        return new Query(this._app).all()
    }
    where(column,arg1=null,arg2=null)
    {
        return this.query().from(this._table).where(column,arg1,arg2)
    }
    search(column,value,cb=()=>{})
    {
        return (async ()=>{
            return (await this.query()
                .search(column,value)
                .all()
                .from(this._table)
                .run(cb))
        })()
    }
    find(id,cb=()=>{})
    {
        return (async ()=>{
            return (await this.query()
                .find(id)
                .all()
                .from(this._table)
                .run(cb))[0]
        })()
    }
    save(cb=()=>{})
    {
        const promise = new Promise((resolve,reject)=>{
            const data = this.modelObject()
            if(data.id)
            {
                this._database.update(this._table,data,data=>{
                    
                    let result = data
                    const Model   = guessModel(this._table)
                    if(Model)
                    {
                        result = new Model(this._contracts)
                        Object.keys(data).map(
                            key=>{
                                result[key] = data[key]
                                this.key = data[key]
                            }
                        )
                    }
                    resolve(result)
                    if((typeof cb) == 'function')
                    {
                        cb(result)
                    }
                })
            }
            else
            {
                this._database.insertInto(this._table,data,data=>{
                    let result = data
                    const Model   = guessModel(this._table)
                    if(Model)
                    {
                        result = new Model(this._contracts)
                        Object.keys(data).map(
                            key=>result[key] = data[key]
                        )
                    }
                    resolve(result)
                    if((typeof cb) == 'function')
                    {
                        cb(result)
                    }
                })
            }
        })
        return promise
    }
}
class Contract extends Model{
    name
    intervenant
    goals
    facts
    group
}
class Fact extends Model{
    name
    goal
    contract
    intervenant
    group
}
class Intervenant extends Model{
    name
    contracts
}
class IntervenantRole extends Model{
    intervenant_id
    role_id
}
class Goal extends Model{
    name
    contract
}
class RolePermission extends Model{
    role_id
    permission_id
}
class Permission extends Model{
    name
    description
}
class Role extends Model{
    name
    description
}
class Group extends Model{
    name
    liste
    index = -1
    listOf = []
    liste = []
    current = null
    constructor(name,liste=[],listOf=null)
    {
        liste.map(this.add)
        if(!listOf)
        {
            listOf = []
            this.liste.map(item=>
            {
                typeOf = getClass(item) ?? (typeof item)
                if(!listOf.includes(typeOf))
                {
                    listOf.push(typeOf)
                }
            })
        }
        this.isListOf(listOf)
    }
    getCurrent()
    {
        if(this.index >= 0 && (this.liste.length > this.index))
        {
        return this.liste[this.index]
        }
        return this.current
    }
    add(item)
    {
        this.liste.push(item)
    }
    deleteAt(index)
    {
        this.liste.splice(index,1)
    }
    next()
    {
        this.current = null
        if(this.index+1 == this.liste.length)
        {
            this.index = -1
            return this.current
        }
        this.index++
        this.current = this.liste[this.index]
        return this.current
    }
    previous()
    {
        this.current = null
        if(this.index <= 0)
        {
            this.index=-1
            return this.current
        }
        this.index--
        this.current = this.liste[this.index]
        return this.current
    }
    isListOf(type=null)
    {
        if(type)
        {
            this.listOf = Array.isArray
            (type) ? type : [type]
        }
        return this.listOf
    }
}
module.exports = {Contract,Fact,Intervenant,Goal,Group,getClass,getClassName,Role,Permission,RolePermission,IntervenantRole}