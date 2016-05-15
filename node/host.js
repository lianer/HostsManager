var fs = require('fs');

/**
 * writeFile errorno:
 * -4048: 无权限
 * -4058: 文件未找到
 */

var src;
if(process.platform === 'linux') {
	src = '/etc/hosts';
}
else{
	src = 'C:/Windows/System32/drivers/etc/hosts';
}


var ERROR_MESSAGE = {
	"-4048": "请使用管理员权限运行",
	"-4058": "未找到hosts文件"
};

var read = function (cb) {
	fs.readFile(src, function (err, file) {
		if(err){
			throw err;
		}
		cb(file.toString());
	});
};

var write = function (str, cb) {
	var err = fs.writeFile(src, str, function (err) {
		if(err){
			if(err.errno in ERROR_MESSAGE){
				alert(ERROR_MESSAGE[err.errno]);
			}
			else{
				alert("保存失败，未知错误");
			}
			throw err;
		}
		cb && cb();
	});
};

// 127.0.0.1       localhost
// 127.0.0.1	acdid.acdsystems.com


module.exports = {
	read: read,
	write: write,
};


// read(function (str) {
// 	console.log(str);
// });
