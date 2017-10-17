sap.ui.define([
	 "sap/ui/base/Object"
], function(Object) {
	"use strict";
	var instance;
	
	var Singelton = funcion(){
		alert("");
	};
	
	function _testFunction(){
		this._test = "this._test";
		this.protoFunc();
	}
	
	Singelton.prototype.protoFunc = function(){
		alert("Singelton.prototype.protoFunc");
	}

	return {
        getInstance: function () {
            if (!instance) {
                instance = new Singelton();
            }
            return instance;
        }
    };
});