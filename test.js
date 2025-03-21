const fs = require('fs')
try{
    console.info(fs.statSync('./o'))
}
catch(e){
    console.error(e.code)
}