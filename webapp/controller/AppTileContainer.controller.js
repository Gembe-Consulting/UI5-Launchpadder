sap.ui.define([
        "launchpadder/controller/BaseController",
        "sap/ui/model/json/JSONModel"
    ], function (BaseController, JSONModel) {
    "use strict";

    return BaseController.extend("launchpadder.controller.AppTileContainer", {

        onInit : function () {

        },

        onTilePressGetCustomData : function (oEvent) {
            var oSource = oEvent.getSource();
            jQuery.sap.log.info(oSource.data("tileAppId") + " navigate to " + oSource.data("tileAppUrl"), oSource);
        }
    });
});