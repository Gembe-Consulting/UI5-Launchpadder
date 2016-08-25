sap.ui.define([
        "launchpadder/controller/BaseController",
        "sap/ui/model/json/JSONModel"
    ], function (BaseController, JSONModel) {
    "use strict";

    return BaseController.extend("launchpadder.controller.App", {

        onInit : function () {

            // apply content density mode to root view
            this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());

            var oShellData = {
                logo : jQuery.sap.getModulePath("sap.ui.core", '/') + "mimes/logo/icotxt_white_220x72_blue.png"
            };
            this.getOwnerComponent().getModel("shellModel").setData(oShellData);

            var oUserData = {
                userFirstName : "Philipp",
                userLastName : "Gembe",
                userFullName : "Gembe, Philipp",
                userImage : "sap-icon://person-placeholder"
            };
            this.getOwnerComponent().getModel("userModel").setData(oUserData);
        },

        onNavToLaunchpad : function () {
            this.getRouter().navTo("launchpad");
        }
    });
});
