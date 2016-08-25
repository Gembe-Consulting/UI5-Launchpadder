sap.ui.define([
		"launchpadder/controller/BaseController",
		"sap/ui/model/json/JSONModel"
	], function (BaseController, JSONModel) {
		"use strict";

		return BaseController.extend("launchpadder.controller.NotFound", {
			onInit: function () {
				var oRouter, oTarget;
				oRouter = this.getRouter();
				oTarget = oRouter.getTarget("notFound");
				
				// store the custom data that we are passing on when displaying the target manually
				oTarget.attachDisplay(function (oEvent) {
					this._oData = oEvent.getParameter("data"); 
				}, this);
			},
			onNavBack : function (oEvent){
				//var oHistory, sPreviousHash, oRouter;
				// in some cases we could display a certain target when the back button is pressed
				if (this._oData && this._oData.fromTarget) {
					this.getRouter().getTargets().display(this._oData.fromTarget);
					delete this._oData.fromTarget;
					return;
				}
				// call the parent's onNavBack
				BaseController.prototype.onNavBack.apply(this, arguments);
			}
		});

	}
);