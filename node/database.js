var fs = require('fs');
var path = require('path');

var src = path.join(__filename, '../../data/database.json');

var read = function (name, cb) {
	fs.readFile(src, function (err, file) {
		if(err){
			throw err;
		}
		var value;
		try{
			value = JSON.parse(file.toString())[name];
		}catch(e){
			
		}
		cb && cb(value);
	});
};

var write = function (name, value, cb) {
	fs.readFile(src, function (err, file) {
		if(err){
			throw err;
			return;
		}
		var data = {};
		try{
			data = JSON.parse(file.toString());
		}catch(e){
			
		}
		data[name] = value;
		data = JSON.stringify(data);
		fs.writeFile(src, data, function (err) {
			cb && cb();
		});
	});
};


module.exports = {
	read: read,
	write: write
};

// write("schemes", [{x: 1}], function (err) {
// 	console.log(err);
// });

// read("schemes", function (err, schemes) {
// 	console.log(schemes);
// });