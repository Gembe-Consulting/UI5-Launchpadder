sap.ui.define([], function() {
	"use strict";
	var instance;
	// create a new class
	function Test() {
		function myTest() {
			alert("function myTest");
		}
		this.myProperty = "my Property";
		
		this.myFunction = function (){
			alert("this.myFunction");
			alert(newProperty);
		};
		
		var newProperty = "new Property";
	}

	Test.prototype.protoFunction = function(){
		alert("Test.prototype.protoFunction");
	}
	// add methods to its prototype
	//    Test.prototype.foo = function() {
	//    }

	return {
		getInstance: function() {
			if (!instance) {
				instance = new Test();
			}
			return instance;
		}
	};
});

// sap.ui.define("launchpadder.services.Test",[],
// 	function() {
// 		"use strict";
// 		/**
// 		 * @class Class for 
// 		 *
// 		 */

// 		var Test = function() {

// 		};

// 		/*		Test.prototype.init = function() {
// 					jQuery.sap.log.info("init Method");
// 				};

// 				Test.prototype.fireHashChanged = function(newHash, oldHash) {
// 					this.fireEvent("hashChanged", {
// 						newHash: newHash,
// 						oldHash: oldHash
// 					});
// 				};*/

// 		Test.prototype.getValue = function() {
// 			return 1;
// 		};

// 		var _oInstance;

// 		Test.getInstance = function() {
// 			if (!_oInstance) {
// 				_oInstance = new Test();
// 			}
// 			return _oInstance;
// 		};

// 	});