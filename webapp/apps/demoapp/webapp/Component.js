sap.ui.define([
		"sap/ui/core/UIComponent"
	], function (UIComponent) {
	"use strict";
	return UIComponent.extend("demoapp.Component", {
		metadata : {
			rootView : 'demoapp.view.App'
		},
		init : function () {
			// call the init function of the parent
			UIComponent.prototype.init.apply(this, arguments);
		},

		/**
		 * Get the path of our own script; module paths are registered relative to this path, not
		 * relative to the HTML page we introduce an ID for the bootstrap script, similar to UI5;
		 * allows to reference it later as well
		 * @return {String} path of the bootstrap script
		 */
		getBootstrapScriptPath : function () {
			var oScripts,
			oBootstrapScript,
			sBootstrapScriptUrl,
			sBootstrapScriptPath;
			oBootstrapScript = window.document.getElementById("sap-ushell-bootstrap");
			if (!oBootstrapScript) {
				// fallback to last script element, if no ID set (should work on most browsers)
				oScripts = window.document.getElementsByTagName('script');
				oBootstrapScript = oScripts[oScripts.length - 1];
			}
			sBootstrapScriptUrl = oBootstrapScript.src;
			sBootstrapScriptPath = sBootstrapScriptUrl.split('?')[0].split('/').slice(0, -1).join('/') + '/';
			return sBootstrapScriptPath;
		}
	});
});
