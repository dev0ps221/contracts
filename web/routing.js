#!/usr/bin/env node
const {join} = require('path')
const {readFileSync,statSync} = require('fs')
class Router{
    routes = {
        get:[],post:[],put:[],delete:[]
    }
    constructor(app,path)
    {
        this.app = app   
        this.path = path ?? this.app.x_app_path + "/render"
        this.self_routes()
    }
    file_exists(pathfile)
    {
        let exists = true
        try{
            (statSync(pathfile))
        }
        catch(e){
            exists = (e.code != 'ENOENT')
            console.info(e.code)
        }

        console.info(pathfile,' check',exists)
        return exists
    }
    get_index(req,res)
    {
        this.serve_file(res,'index.html')
        return this
    }
    serve_file(res,file_path)
    {
        let pathfile = join(this.path, file_path)
        console.info('serving ',file_path)
        pathfile = (this.file_exists(pathfile)) ? pathfile : join(this.path,'notfound.html')
        res.sendFile(pathfile);
        return this
    }
    self_routes()
    {
        Object.keys(this).map(
            (key)=>{
                const methods = ['get','post','put','delete']
                methods.map(
                    method=>{
                        const chars = key.split("")
                        if((chars.length > 1) && (chars[0]+""+chars[1]) == (method+'_'))
                        {
                            let route = key.replace((method+"_"),'')
                            if(!this.routes[method])
                            {
                                this.routes[method] = []
                            }
                            this.routes[method].push(
                                {route,action:this.key}
                            )
                        }
                    }
                )
            }
        )
        this.refreshRoutes()
        return this
    }
    refreshRoutes()
    {
        Object.keys(this.routes).map(
            method=>{
                this.routes[method].map(
                    ({route,action})=>{
                        this.app[method](
                            route,(req,res)=>{
                                action(req,res)
                            }
                        )
                    }
                )
            }
        )
        return this
    }
    get_view(route,viewname)
    {
        this.get(route,(req,res)=>{
            this.serve_file(res,viewname)
            return this
        })
        return this
    }
    get_page(route)
    {
        console.info('routed...',route)
        this.get(route,(req,res)=>{
            console.info('route is ',req.params.name)
            const viewname = 'pages/' + req.params.name + '.html'
            console.info('viewname is ',viewname)
            return this.serve_file(res,viewname)
        })
        return this
    }
    get(route,action)
    {
        this.routes.get.push({route,action})
        this.refreshRoutes()
        return this
    }
    post(route,action)
    {
        this.routes.post.push({route,action})
        this.refreshRoutes()
        return this
    }
    put(route,action)
    {
        this.routes.put.push({route,action})
        this.refreshRoutes()
        return this
    }
    delete(route,action)
    {
        this.routes.delete.push({route,action})
        this.refreshRoutes()
        return this
    }
}
module.exports = {Router}