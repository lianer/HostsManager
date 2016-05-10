

var node = function () {
	var node = {};

	if(typeof require !== "function"){
		window.require = function() {};
	}

	var database = require("./node/database.js");
	var host = require("./node/host.js");

	node.readSchemes = function (cb) {
		if(database){
			database.read("schemes", function (err, data) {
				cb(schemes);
			});
		}
		else{
			var schemes = [
				extendScheme({
					name: "当前方案",
					checked: true,
					type: "all",
				})
			];
			cb(schemes);
		}
	};

	node.writeSchemes = function (schemes) {
		database.write("schemes", schemes);
	};

	node.readHosts = function (cb) {
		host.read(function (err, str) {
			if(err){
				alert(err);
			}
			else{
				cb(str);
			}
		});
	};

	node.writeHost = function (schemes) {
		host.write(schemes, function (err) {
			if(err){
				if(err.errno in host.ERROR_MESSAGE){
					alert(host.ERROR_MESSAGE[err.errno]);
				}
				else{
					alert("未知错误");
				}
				return;
			}
		});
	};

	

	return node;
}();


var extendScheme = function (o) {
	var scheme = {
		id: new Date() * 1 + Math.random(),
		name: "未命名",
		checked: false,
		type: "item",
		value: "#未命名",
	};
	$.extend(scheme, o);
	return scheme;
};


node.readSchemes(function (schemes) {
	var methods = {
		add: function (name) {
			if(typeof name !== "string"){
				name = prompt("请输入方案名");
			}
			if(name){
				var m = extendScheme({
					name: name,
					value: "#" + name,
					checked: true,
				});
				vm.$data.schemes.push(m);
				vm.select(m);
			}
		},
		del: function () {
			if(vm.$data.current.type === "item"){
				var sure = confirm("确认删除该方案？");
				if(sure){
					var index = vm.$data.schemes.indexOf(vm.$data.current);
					vm.$data.schemes.splice(index, 1);
				}
			}
		},
		edit: function () {
			if(vm.$data.current.type === "item"){
				var name = prompt("请输入方案名");
				if(name){
					var m = vm.$data.current;
					m.name = name;
				}
			}
		},
		save: function () {
			var schemes = getAllSchemes();
			node.writeHost(schemes);

			schemes = _.map(vm.$data.schemes, function (scheme) {
				return {
					id: scheme.id,
					name: scheme.name,
					checked: scheme.checked,
					type: scheme.type,
					name: scheme.name,
				};
			});
			node.writeSchemes(schemes);
		},
		select: function (scheme) {
			vm.$data.current = scheme;

			if(scheme.type === "all"){
				node.readHosts(function (host) {
					cm.setValue(host);
				});
				// cm.setOption("readOnly", "nocursor");
				// cm.setValue(getAllSchemes());
			}
			else{
				cm.setOption("readOnly", false);
				cm.setValue(scheme.value || "");
			}
		}
	};

	var getAllSchemes = function () {
		var value = [];
		vm.$data.schemes.forEach(function (scheme) {
			if(scheme.type === "item" && scheme.checked === true){
				value.push(scheme.value);
			}
		});
		value = value.join("\n");
		return value;
	};

	var vm = new Vue({
		el: "#scheme",
		data: {
			current: schemes[0],
			schemes: schemes,
		},
		methods: methods,
	});

	var cm = CodeMirror.fromTextArea($("#editor-textarea")[0], {
		mode: "powershell",
		tabSize: 8,
		lineNumbers: true,  // 显示行号
		styleActiveLine: true,  // 高亮选中行
		keyMap: "sublime",  // 快捷键，依赖keymap/sublime.js，依赖于addon/search/searchcursor.js
		// viewportMargin: Infinity,  // 自适应内容高度
		// scrollbarStyle: "simple",  // 简单的滚动条，有依赖
	});

	cm.on("change", function (cm) {
		vm.$data.current.value = cm.getValue();
	});

	cm.on("gutterClick", function (cm, line) {
		// 注释
		var firstChar = cm.getRange({line: line, ch: 0}, {line: line, ch: 1});
		if(firstChar === "#"){
			cm.replaceRange("", {line: line, ch: 0}, {line: line, ch: 1});
		}
		else{
			cm.replaceRange("#", {line: line, ch: 0});
		}
	});
});



