sap.ui.define([
		"launchpadder/controller/BaseController",
		"sap/ui/model/json/JSONModel"
	], function (BaseController, JSONModel) {
	"use strict";

	return BaseController.extend("launchpadder.controller.AppTileContainer", {

		onInit : function () {
			
			var oRouter = this.getRouter();

		},
		
		openWorklist: function (oControlEvent) {
			
			var sShellComponentId = this.getOwnerComponent().getId();
			
			var oShellComponent = sap.ui.component(sShellComponentId);
			
			jQuery.sap.registerModulePath("worklist", "./apps/worklist/webapp/");
			jQuery.sap.registerModulePath("sap.ui.demo.worklist", "./apps/worklist/webapp/");
			var sURL = jQuery.sap.getModulePath("worklist");

			
			var oConfig = {
				name: "worklist",
				url: sURL
			};
			
			//Creates a new SAPUI5 component for the given container and makes it a child.
			var oComponent = sap.ui.component(oConfig);
			
			var oContainer = new sap.ui.core.ComponentContainer({
				component : oComponent
			});

 
			oContainer.placeAt(sShellComponentId + "---rootApp--launchpadderShell", "only");
		},

		openExternalComponent : function (oControlEvent) {
			
			var sShellComponentId = this.getOwnerComponent().getId();
			
			var oShellComponent = sap.ui.component(sShellComponentId);
			
			//var oShellComponentHandle = oShellComponent.getComponentHandle(),

			//jQuery.sap.registerModulePath('myModule','/sap/bc/ui5_ui5/sap/zui5_trip_conf/components')
			//You tell the core to look for everything that starts with "myModule" in "/sap/bc/[...]".
			//The most important part: We register the path to the folder of the component file and assign it a prefix.
			//Inside the component we start every single Object/Element/Control/etc. with the same prefix as the component. (In your case: "zui5_conf_try").
			jQuery.sap.registerModulePath("demoapp", "./apps/demoapp/webapp/");
			var sURL = jQuery.sap.getModulePath("demoapp");

			
			var oConfig = {
				name: "demoapp",
				url: sURL
			};
			
			//Creates a new SAPUI5 component for the given container and makes it a child.
			var oComponent = sap.ui.component(oConfig);
			
			var oContainer = new sap.ui.core.ComponentContainer({
				component : oComponent
			});
			
			//var oShellRootControl = oShellComponent.getRootControl();
			//oShellRootControl.addContent(oContainer);
			
			// ToDo: destroy the child control before creating a new control with the same ID
 
			oContainer.placeAt(sShellComponentId + "---rootApp--launchpadderShell", "only");
			
			// Disable routing
			//oContainer._disableRouterEventHandler = sap.ushell.components.container.ApplicationContainer.prototype._disableRouter.bind(this, oComponent)

			//var oRouter = this.getRouter();
			//var oHashChanger = oRouter.oHashChanger;
			//oHashChanger.setHash("apps/demoapp/index.html");
			
			
/*            if(oMetadata.title){
                window.document.title = oMetadata.title;
            } else {
                jQuery.sap.log.debug("Shell controller._initiateApplication: the title of the window is not changed because most probably the application was resolved with undefined");
            }*/

		},

		onAppTilePress : function (oEvent) {
			var oSource = oEvent.getSource();
			jQuery.sap.log.info(oSource.data("tileAppId") + " navigate to " + oSource.data("tileAppUrl"), oSource);

			this._navigateToTileApp(oSource.data());

		},
		_navigateToTileApp : function (oTileData) {
			var oRouter = this.getRouter();
			var oHashChanger = oRouter.oHashChanger;
			
			var sShellComponentId = this.getOwnerComponent().getId();
			
			var oShellComponent = sap.ui.component(sShellComponentId);
			
			//var oShellComponentHandle = oShellComponent.getComponentHandle(),

			//jQuery.sap.registerModulePath('myModule','/sap/bc/ui5_ui5/sap/zui5_trip_conf/components')
			//You tell the core to look for everything that starts with "myModule" in "/sap/bc/[...]".
			//The most important part: We register the path to the folder of the component file and assign it a prefix.
			//Inside the component we start every single Object/Element/Control/etc. with the same prefix as the component. (In your case: "zui5_conf_try").
			jQuery.sap.registerModulePath(oTileData.tileAppId, oTileData.tileAppUrl);
			var sURL = jQuery.sap.getModulePath(oTileData.tileAppId);

			
			var oConfig = {
				name: oTileData.tileAppId,
				url: sURL
			};
			
			//Creates a new SAPUI5 component for the given container and makes it a child.
			var oComponent = sap.ui.component(oConfig);
			
			var oTarget = oRouter.getTarget(oTileData.tileAppId);
			
			oTarget._oViews._oComponent = oComponent;

			var oNewTarget = sap.m.routing.Targets();

			if (oTileData.tileAppUrl) {
				if (oTileData.tileAppUrl[0] === "#") {
					oHashChanger.setHash(oTileData.tileAppUrl);
				} else {
					window.open(oTileData.tileAppUrl, "_blank");
				}
			}

		}
	});
});