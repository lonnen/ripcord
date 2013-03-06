// THIS IS A POOR MozActivity SHIM
if (typeof(MozActivity) == 'undefined') {
	console.log('MozActivity not supported.');
	MozActivity = function(hash) {
		function enumerate(hash, prefix) {
			var key, value;
			if (!prefix) {
				prefix = ""
			}
			for (key in hash) {
				value = hash[key];
				if (typeof(value) === "object") {
					console.log(prefix + "values for key: " + key);
					enumerate(value, prefix + "  ");
					continue
				}
				console.log(prefix + key + ": " + value);
			}
		}
		enumerate(hash);
		return {};
	}
}

var Ripcord = {

	/*
	 * Immedietly execute a function and capture errors
	 */
	context: function(fn, options) {
		Ripcord.wrap(options, fn).apply(this, arguments);
	},

	/*
	 * Send an error
	 */
	error: function(error, options) {
		var payload = {type: "error"};

		safeMerge(payload, error);
		if (options) {
			safeMerge(payload, options);
		}

		this.submit(payload);
	},

	/*
	 * Send a non-error message
	 */
	info: function(msg, options) {
	 	var payload = {
	 		type: "message",
	 		message: msg
	 	}

	 	if (options) {
	 		safeMerge(payload, options);
	 	}

	 	this.submit(payload);
	},

	/*
	 * Override `window.onerror`
	 */
	install: function() {
		var handlers = [],
			_oldOnerror = window.onerror;

		handlers.push(function onErrorFn(msg, url, lineNum, colNum) {
			var payload = {
					"errorMsg": msg,
					"url": url,
					"lineNumber": lineNum
				};

			if (typeof(colNum) !== 'undefined') {
				payload['columnNumber'] = colNum;
			}

			return Ripcord.error(payload);
		});

		if (typeof(_oldOnerror) === 'function') {
			handlers.push(_oldOnerror);
		}

		window.onerror = function() {
			var i, j;
			for (i = 0, j = handlers.length; i < j; i++) {
				handlers[i].apply(this, arguments);
			}
		};
	},

	/*
	 * Remove our override of window.onerror and restore what was there
	 */
	uninstall: function() {
		var i, j, handlers = window.onerror.handlers;
		for (i = 0, j = handlers.length; i < j; i++) {
			if (handlers[i].name !== "onErrorFn") {
				continue;
			}
			handlers.splice(i, 1);
			break;
		}
		if (handlers.length === 0) {
			window.onerror = undefined;
		}
	},

	/*
	 * Submit a payload
	 */
	submit: function(payload) {
		var mozAct = {
			name: "error", // MozActivity
			data: payload
		}
		MozActivity(mozAct);
	},

	/*
	 * Returns a wrapped
	 */
	 wrap: function(fn, options) {
	 	return function() {
	 		try {
	 			fn.apply(this, arguments);
	 		} catch(e) {
	 			Ripcord.error(e, options);
	 		}
	 	}
	 }
};

/*
 * Merge options hash into preserve hash, renaming keys instead of overwriting
 */
function safeMerge(preserve, options) {
	var rename = function(name) {
		var num = 0,
			newName = name;

		while (typeof(preserve[newName]) !== "undefined") {
			newName  = name + num;
			num++;
		}

		return newName;
	}

	for (var key in options) {
		preserve[rename(key)] = options[key];
	}
}