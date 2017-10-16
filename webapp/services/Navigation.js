sap.ui.define([
    "launchpadder/services/NavigationHashChanger"
], function (NavigationHashChanger) {
    "use strict";
    function Navigation(oServiceConfiguration) {
    	
    	var oServiceConfig = oServiceConfiguration || {};
    	
    	this.hashChanger = new NavigationHashChanger(oServiceConfig);
    	


        this.init = function (fnShellCallback) {
            hasher.prependHash = "";
            sap.ui.core.routing.HashChanger.replaceHashChanger(this.hashChanger);
            //var oBus = sap.ui.getCore().getEventBus();
            this.hashChanger.initNavigation(fnShellCallback);
            return this;
        };
    }// Navigation
    
        return Navigation;

}, true /* bExport */);