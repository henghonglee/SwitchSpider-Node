
/*
 * GET home page.
 */
var auth = require('http-auth');
var basic = auth({
    authRealm : "Private area.",
    authList : ['henghonglee:password']
});

exports.index = function(req, res){
	basic.apply(req, res, function(username) {
		res.render('index', {	title:	'Hello World' });
  });
};

exports.switch_index = function(req, res){
	basic.apply(req, res, function(username) {
		res.render('switch_index', { title: username });
  });
};