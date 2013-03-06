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

// RIPCORD STUFF

// create an error MozActivity
(function(){
	var button = document.getElementById("moz-intent"),
		message = function() {
			Ripcord.submit({"test": true}); // null case, not a great idea to call directly
			console.log("MozActivity submitted");
		};

	button.addEventListener("click", message);
})();

// raise an uncaught reference error
(function(){
	var button = document.getElementById("uncaught"),
		triggerUncaught = function() {
			purposefullyUndefinedFunction();
		};

	Ripcord.install(); // setup unhandled listener
	button.addEventListener("click", triggerUncaught);
})();

// raise a reference error and catch it using ripcords instrumented catch
(function(){
	var button = document.getElementById("caught"),
		triggerCaught = function() {
			try{
				purposefullyUndefinedFunction();
			}
			catch (e) {
				console.log("Caught an error!");
				Ripcord.error(e);
			}
		};

	button.addEventListener("click", triggerCaught);
})();
