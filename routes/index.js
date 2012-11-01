
/*
 * GET home page.
 */
var auth = require('http-auth');
var basic = auth({
    authRealm : "Private area.",
    authList : ['henghonglee:password']
});
var gpio = require('rpi-gpio');

exports.index = function(req, res){
	basic.apply(req, res, function(username) {
		res.render('index', {	title:	'Hello World' });
  });
};

exports.switch_index = function(req, res){
	basic.apply(req, res, function(username) {

		gpio.read(7,function(err,result){
        	res.render('switch_index', { title: username , on: result});			
			});

				 
  });
};