var express = require('express')
  , path = require('path')
  , app = express()
  , http = require('http')
  , server = http.createServer(app)
  , hbs = require('hbs')
  , fs = require('fs')
  , hbs = require('hbs');

/*==========  Parsing JSON for DB Information  ==========*/

if(process.env.VCAP_SERVICES) {
    var env = JSON.parse(process.env.VCAP_SERVICES);
    var mongo = env['mongodb-1.8'][0]['credentials'];
} else {
    var mongo = { "hostname":"localhost", "port":27017, "username":"", "password":"" }
}

var generate_mongo_url = function(obj){
    obj.hostname = (obj.hostname || 'localhost');
    obj.port = (obj.port || 27017);
    obj.db = (obj.db || 'test');
    if(obj.username && obj.password){
        return "mongodb://" + obj.username + ":" + obj.password + "@" + obj.hostname + ":" + obj.port + "/" + obj.db;
    }
    else{
        return "mongodb://" + obj.hostname + ":" + obj.port + "/" + obj.db;
    }
};

/*==========  Parsing JSON for DB Information  ==========*/

var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , mongourl = generate_mongo_url(mongo)
  , db = mongoose.createConnection(mongourl);


/*=============================================
=               App Configuration             =
=============================================*/

app.configure( function() { 
  app.set('title', 'Example Application');
  app.set('port', process.env.VCAP_APP_PORT || 8080);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'hbs');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(require('less-middleware')({ src: __dirname + '/public' }));
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(app.router);
});

app.use(function(req, res, next){
  if (req.accepts('html')) {
    res.status(404);
    res.render('404', { url: req.url });
    return;
  };
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

/*-----  End of App Configuration  ------*/

db.once('open', function callback () {
  dblayout = { name: String },
  scheme = new mongoose.Schema(dblayout),
  entry = db.model('entry', scheme);
  
  app.get('/', function(req, res){
    res.render('index', { title: app.get('title') });
  });

  app.listen(app.get('port'), function(){
    console.log("listening on port " + app.get('port'));
  });

});
