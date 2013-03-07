var handleMozActivity = function(req) {
	var source = req.source,
		name = source.name,
		data = source.data,
		enumeratedData = (function(data){
			function enumerate(hash, stack) {
				var key, value;
				if (!stack) {
					stack = []
				}
				for (key in hash) {
					value = hash[key];
					if (typeof(value) === "object") {
						enumerate(value, stack);
						continue
					}
					stack.push({'name': key, 'property': value})
				}
				return stack;
			}
			return enumerate(data);
		})(data),
		template = Mustache.compile(
				   "<h2>{{source}} encountered an error.</h2>" +
				   "<ul>" +
				   	 "{{#datums}}" +
				     	"<li><em>{{name}}</em> - {{property}}</li>" +
				     "{{/datums}}" +
				   "</ul>");
	var errors = document.getElementById("errors");
	if (!errors) {
		throw new Error("cannot report error to user. ui seems to be missing.");
	}

	errors.innerHTML = Mustache.render(
		template,
		{'source': source, 'data': enumeratedData}
	);
};

document.body.addEventListener('dragstart', function(e) {
    e.preventDefault();
});

var hasTouch = ('ontouchstart' in window) ||
               window.DocumentTouch &&
               document instanceof DocumentTouch;

var actEvent = hasTouch ? "touchstart" : "click";

(function() {
	var request = window.navigator.mozApps.getSelf();
	request.onsuccess = function() {
		if (!request.result) {
			promptInstall();
			return;
		}
		// only register if the app is installed
		if (navigator.mozSetMessageHandler) {
			navigator.mozSetMessageHandler('activity', function(){});
		}
	}
	request.onerror = function() {
		promptInstall();

	}
})();

var installEl = document.getElementById('install');

function promptInstall() {
    installEl.style.display = "block";
}

installEl.addEventListener(actEvent, installApp);

function installApp(e) {
    e.preventDefault();
    var manifestPath = (function(h) {
    	return h.slice(0, h.lastIndexOf('/')+1) + 'manifest.webapp';
    })(window.location.href)
    console.log('install triggered: ' + manifestPath);
    var r = window.navigator.mozApps.install(manifestPath);
    r.onsuccess = function() {
        console.log('success!');
    }
    r.onerror = function() {
        console.log('error!');
    }
}
