
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

var apns = require("apns"), options, connection, notification;

options = {
   keyFile : "sskey.pem",
   certFile : "sscert.pem",
   gateway : "gateway.sandbox.push.apple.com",
   debug : true
};

connection = new apns.Connection(options);

notification = new apns.Notification();
notification.device = new apns.Device("1efd470f822793df6960abc6637481d8975f848bd381a9796b0a202ff3356f90");
notification.badge = 1;
notification.sound = "dong.aiff";
notification.payload = {"aps" : {"alert":"test!"}};
notification.alert = "Server is now running!";
connection.sendNotification(notification);


gpio.removeAllListeners();
gpio.setup(8,gpio.DIR_IN);
var listener = setInterval(function(){gpio.read(8, function(err, value) {console.log('The value is ' + value);});	},3000);

//gpio.on('change', function(channel, value) {console.log('Channel ' + channel + ' value is now ' + value);});

function write() {gpio.write(7, true, function(err) {if (err) throw err;console.log('Written to pin');});}
function unwrite() {gpio.write(7, false, function(err) {if (err) throw err;console.log('Written to pin');});}
function write11() {
      gpio.write(8, true, function(err) {
          if (err) throw err;
          console.log('Written to pin');
      });
}
function unwrite11() {
    gpio.write(8, false, function(err) {
        if (err) throw err;
        console.log('Written to pin');
    });
}	
var timeout;
app.get('/switch/test', function(req,res){
	basic.apply(req, res, function(username) {
		gpio.read(7,function(err,result){
        	if(result){
				res.writeHead(200, {'Content-Type': 'text/plain'});
				  res.end('true');
			}else{
				res.writeHead(200, {'Content-Type': 'text/plain'});
				  res.end('false');
			}		
			});
		
		});
});

app.get('/switch/:id/on', function(req,res){
	basic.apply(req, res, function(username) {
					console.log("turning on pin7" + timeout);
					gpio.setup(7, gpio.DIR_OUT, write);
			clearTimeout(timeout);		
          timeout = setTimeout(function(){
			console.log("done with heating, turning switch off");
			notification.alert = "Switch turned off after 5000ms";
			connection.sendNotification(notification);
			gpio.setup(7, gpio.DIR_OUT, unwrite);
			},5000);
			
				res.redirect('/switch');
  });
});
app.get('/switch/:id/off', function(req,res){
	basic.apply(req, res, function(username) {
		clearTimeout(timeout);
		console.log("turning off pin7");
		gpio.setup(7, gpio.DIR_OUT, unwrite);
		res.redirect('/switch');
  });
});

app.get('/switch', routes.switch_index);
app.get('/', routes.index);


http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
