#!/usr/bin/env node

function getClassName(obj)
{
    const models = require('./models')
    let _classname = null
    Object.keys(
        models
    ).map(
        key=>{
            if(obj instanceof (models[key]))
            {
                _classname = key
            }
        }
    )
    return _classname
}
function getClass(obj)
{
    const models = require('./models')
    let _class = null
    Object.keys(
        models
    ).map(
        key=>{
            if(obj instanceof (models[key]))
            {
                _class = models[key]
            }
        }
    )
    return _class
}
function isUpperCase(char)
{
    return char == char.toUpperCase()
}
function isLowerCase(char)
{
    return char == char.toLowerCase()
}
function guessTable(item)
{
    if((typeof item) === 'object')
    {
        item = getClassName(item)
    }
    const size = item.length
    item = item.split("")
    let name = ""
    for(let i =0 ; i < size ; i++)
    {
        if(i!==0)
        {
            if(isUpperCase(item[i]))
            {
                name+="_"
            }
        }
        name+=item[i].toLowerCase()
    }
    if(item[item.length-1]!='s')
    {
        name+="s"
    }
    return name
}
function guessModel(table_name)
{
    let match = null
    const models = require('./models')
    const Model = null
    Object.keys(
        models
    ).map(
        key=>{
            match = (guessTable(key) == table_name) ? models[key] : match
        }
    )
    return match
}
module.exports = { getClass, getClassName, guessTable, guessModel }