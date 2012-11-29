express = require("express")
path = require("path")
app = express()
http = require("http")
server = http.createServer(app)
hbs = require("hbs")
fs = require("fs")
hbs = require("hbs")

if process.env.VCAP_SERVICES
  env = JSON.parse(process.env.VCAP_SERVICES)
  mongo = env["mongodb-1.8"][0]["credentials"]
else
  mongo =
    hostname: "localhost"
    port: 27017
    username: ""
    password: ""
generate_mongo_url = (obj) ->
  obj.hostname = (obj.hostname or "localhost")
  obj.port = (obj.port or 27017)
  obj.db = (obj.db or "test")
  if obj.username and obj.password
    "mongodb://" + obj.username + ":" + obj.password + "@" + obj.hostname + ":" + obj.port + "/" + obj.db
  else
    "mongodb://" + obj.hostname + ":" + obj.port + "/" + obj.db


mongoose = require("mongoose")
Schema = mongoose.Schema
mongourl = generate_mongo_url(mongo)
db = mongoose.createConnection(mongourl)

app.configure ->
  app.set "title", "Example Application"
  app.set "port", process.env.VCAP_APP_PORT or 8080
  app.set "views", __dirname + "/views"
  app.set "view engine", "hbs"
  app.use express.favicon()
  app.use express.logger("dev")
  app.use express.bodyParser()
  app.use express.methodOverride()
  app.use require("less-middleware")(src: __dirname + "/public")
  app.use express.static(path.join(__dirname, "public"))
  app.use app.router

app.use (req, res, next) ->
  if req.accepts("html")
    res.status 404
    res.render "404",
      url: req.url

    return

app.configure "development", ->
  app.use express.errorHandler()

db.once "open", callback = ->
  dblayout = name: String
  scheme = new mongoose.Schema(dblayout)
  entry = db.model("entry", scheme)

  app.get "/", (req, res) ->
    res.render "index",
      title: app.get("title")


  app.listen app.get("port"), ->
    console.log "listening on port " + app.get("port")

