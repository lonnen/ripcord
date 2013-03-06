Ripcord
-------

Webapp error reporting via MozActivities


## The Basics

Ripcord is a utility for handling and reporting errors using MozActivities.

```
try {
	...
} catch (e) {
	Ripcord.error(e);
}
```

You can use it for reporting non-error messages as well.

```
Ripcord.info("500 from CDN for " + lib.name + ". Loading local copy.");
```

All reporting functions accept an optional hash containing additional information.

```
Ripcord.info("Ding! User reached level " + usr.level, {
	"email":    usr.account.email,
	"realname": usr.account.name,
	"username": usr.name
});

Ripcord.error(e, {
	"userAgent": window.navigator.userAgent
});
```

Use builtins to automatically wrap functions in an error catching block.

```
// immedietly executed
Ripcord.context(function() {
	var a = {};
	a['undefined'].thisWillCauseATypeError();
});

// return a wrapped function
var riskyUpdate = function(domNode, anotherDomNode, someUserInput) { ... }

setTimeout(Ripcord.wrap(riskyFN), 1000);
```

Safely register a window.onerror handler
```
window.onerror = function(msg, url, lineNum){ console.log(); }

Ripcord.install();

//TypeError
[0]._
```

...and uninstall it.
```
window.onerror = function(){ /* whatever */ };
Ripcord.install();
window.onerror.handlers.length === 2
Ripcord.uninstall();
window.onerror.handlers.length === 1
```