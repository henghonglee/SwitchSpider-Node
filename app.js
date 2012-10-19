
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path');

var app = express();
var gpio = require('rpi-gpio')

app.configure(function(){
  app.set('port', process.env.PORT || 4000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('your secret here'));
  app.use(express.session());
  app.use(app.router);
  app.use(require('stylus').middleware(__dirname + '/public'));
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});
var auth = require('http-auth');
var basic = auth({
    authRealm : "Private area.",
    authList : ['henghonglee:password']
});

function write() {
	    gpio.write(7, true, function(err) {
	        if (err) throw err;
	        console.log('Written to pin');
	    });
}
function unwrite() {
    gpio.write(7, false, function(err) {
        if (err) throw err;
        console.log('Written to pin');
    });
}
	
app.get('/switch/:id/on', function(req,res){
	basic.apply(req, res, function(username) {
					gpio.setup(7, gpio.DIR_OUT, write);
				res.redirect('/switch');
  });
});
app.get('/switch/:id/off', function(req,res){
	basic.apply(req, res, function(username) {
		
		gpio.setup(7, gpio.DIR_OUT, unwrite);
		res.redirect('/switch');
  });
});
app.get('/switch', routes.switch_index);
app.get('/', routes.index);


http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
