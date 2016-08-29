sap.ui.define([
		"launchpadder/controller/BaseController",
		"sap/ui/model/json/JSONModel"
	], function (BaseController, JSONModel) {
	"use strict";

	return BaseController.extend("launchpadder.controller.AppTileContainer", {

		onInit : function () {},

		openExternalComponent : function (oControlEvent) {

			//jQuery.sap.registerModulePath('myModule','/sap/bc/ui5_ui5/sap/zui5_trip_conf/components')
			//You tell the core to look for everything that starts with "myModule" in "/sap/bc/[...]".
			//The most important part: We register the path to the folder of the component file and assign it a prefix.
			//Inside the component we start every single Object/Element/Control/etc. with the same prefix as the component. (In your case: "zui5_conf_try").
			jQuery.sap.registerModulePath("demoapp", "./apps/demoapp/webapp/");
			jQuery.sap.getModulePath("demoapp");
			var oContainer = new sap.ui.core.ComponentContainer({
				name : "demoapp"
			});
			
			var sComponentId = this.getOwnerComponent().getId();
			
			oContainer.placeAt(sComponentId + "---rootApp--launchpadderShell", "only");

			var oRouter = this.getRouter();
			var oHashChanger = oRouter.oHashChanger;
			oHashChanger.setHash("apps/demoapp/index.html");

		},

		onAppTilePress : function (oEvent) {
			var oSource = oEvent.getSource();
			jQuery.sap.log.info(oSource.data("tileAppId") + " navigate to " + oSource.data("tileAppUrl"), oSource);

			this._navigateToTileApp(oSource.data());

		},
		_navigateToTileApp : function (oTileData) {
			var oRouter = this.getRouter();
			var oHashChanger = oRouter.oHashChanger;

			if (oTileData.tileAppUrl) {
				if (oTileData.tileAppUrl[0] === '#') {
					oHashChanger.setHash(oTileData.tileAppUrl);
				} else {
					window.open(oTileData.tileAppUrl, '_blank');
				}
			}

		}
	});
});
