// 在调试模式中，Vue 会：
// 为所有的警告打印栈追踪。
// 把所有的锚节点以注释节点显示在 DOM 中，更易于检查渲染结果的结构。
// 只有开发版本可以使用调试模式。
Vue.config.debug = true;

// 在加载 Vue 之后立即同步的设置
// 配置是否允许 vue-devtools 检查代码。
// 开发版默认为 true， 生产版默认为 false。
//  生产版设为 true 可以启用检查。
Vue.config.devtools = true



var database = require("./node/database.js");
var host = require("./node/host.js");

// 标准方案格式
var extendScheme = function(o) {
	var scheme = {
		id: new Date() * 1 + Math.random(),
		name: "未命名",
		checked: false,
		value: "#未命名",
	};
	$.extend(scheme, o);
	return scheme;
};

// 从本地存储读取数据
database.read("schemes", function(schemes) {
	// 如果从本地读取到了数据，则直接启动
	if (schemes) {
		start(schemes);
	}
	// 公共方案是当前用户已配置的hosts，默认启用
	else {
		host.read(function(hosts) {
			schemes = [
				extendScheme({
					name: "公共方案",
					checked: true,
					type: "item",
					value: hosts
				}),
			];
			start(schemes);
		});
	}
});

// 启动渲染
function start(schemes) {

	// 实例化CodeMirror
	var cm = window.cm = CodeMirror.fromTextArea($("#editor-textarea")[0], {
		mode: "powershell",
		tabSize: 8,
		lineNumbers: true, // 显示行号
		styleActiveLine: true, // 高亮选中行
		keyMap: "sublime", // 快捷键，依赖keymap/sublime.js，依赖于addon/search/searchcursor.js
		// theme: "mdn-like",
		// theme: "neo",
		theme: "neat",
		// viewportMargin: Infinity,  // 自适应内容高度
		// scrollbarStyle: "simple",  // 简单的滚动条，有依赖
	});

	// 当内容发生变化时，将内容赋值给当前选中的方案的vm对象
	cm.on("change", function(cm) {
		vm.$data.current.value = cm.getValue();
	});

	// 点击行号，注释或取消注释当前行
	cm.on("gutterClick", function(cm, line) {
		if (cm.getOption("readOnly")) {
			return;
		}
		// 注释
		var firstChar = cm.getRange({
			line: line,
			ch: 0
		}, {
			line: line,
			ch: 1
		});
		if (firstChar === "#") {
			cm.replaceRange("", {
				line: line,
				ch: 0
			}, {
				line: line,
				ch: 1
			});
		} else {
			cm.replaceRange("#", {
				line: line,
				ch: 0
			});
		}
	});

	// 失去焦点
	cm.on("blur", function() {
		console.log(this, arguments);
		if (cm.getOption("readOnly")) {
			return;
		}
		vm.$data.current.value = cm.getValue();
		vm.save();
	});

	// 保存
	cm.setOption("extraKeys", {
		"Ctrl-S": function(cm) {
			cm.save();
		}
	});


	// 获取所有方案的总和
	var getAllScheme = function() {
		var value = [];
		vm.$data.schemes.forEach(function(scheme) {
			if (scheme.checked === true) {
				value.push(scheme.value);
			}
		});
		value = value.join("\n");
		return value;
	};

	// vue方法
	var methods = {
		add: function(name) {
			if (typeof name !== "string") {
				name = prompt("请输入方案名");
			}
			if (name) {
				var m = extendScheme({
					name: name,
					value: "#" + name,
					checked: true,
				});
				vm.$data.schemes.push(m);
				vm.select(m);
				vm.save();
			}
		},
		del: function() {
			if (vm.$data.current !== vm.$data.allScheme) {
				var sure = confirm("确认删除该方案？");
				if (sure) {
					var index = vm.$data.schemes.indexOf(vm.$data.current);
					vm.$data.schemes.splice(index, 1);
					vm.select(schemes[index - 1]);
				}
				vm.save();
			}
		},
		edit: function() {
			if (vm.$data.current !== vm.$data.allScheme) {
				var name = prompt("请输入方案名");
				if (name) {
					var m = vm.$data.current;
					m.name = name;
				}
			}
		},
		// 保存方案，会被这些动作触发：切换开关，保存按钮，新增，删除，编辑，编辑器失去焦点
		save: function() {
			var all = getAllScheme();
			host.write(all);

			var _schemes = _.map(vm.$data.schemes, function(scheme) {
				return {
					id: scheme.id,
					name: scheme.name,
					checked: scheme.checked,
					value: scheme.value,
				};
			});
			database.write("schemes", _schemes);
		},
		// 查看方案
		select: function(scheme) {
			vm.$data.current = scheme;

			if (vm.$data.current === vm.$data.allScheme) {
				cm.setOption("readOnly", "nocursor");
				cm.setValue(getAllScheme());
			} else {
				cm.setOption("readOnly", false);
				var value = vm.$data.current.value;
				if (typeof value === "function") {
					value = value();
				}
				cm.setValue(value || "");
			}
		},
		// 切换开关
		toggle: function(scheme) {
			scheme.checked = !scheme.checked;
			vm.save();
		}
	};

	// 实例化vue
	var vm = window.vm = new Vue({
		el: "#scheme",
		data: {
			current: null,
			allScheme: extendScheme({
				name: "当前方案",
				checked: true,
				value: function() {
					return getAllScheme();
				}
			}),
			schemes: schemes,
		},
		methods: methods,
	});

	// 启动默认选中当前系统配置
	vm.select(vm.$data.allScheme);
}