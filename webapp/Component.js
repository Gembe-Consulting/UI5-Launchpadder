sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"launchpadder/model/models",
	"launchpadder/services/History",
	"launchpadder/services/ShellNavigation",
	"launchpadder/services/URLParser"
	//	"launchpadder/services/URLShorter"
], function(UIComponent, Device, models, History, ShellNavigation, URLParser /*, URLShorter*/ ) {
	"use strict";
	/*global jQuery, sap, window, document, setTimeout, hasher*/

	return UIComponent.extend("launchpadder.Component", {

		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * In this method, the device models are set and the router is initialized.
		 * @public
		 * @override
		 */
		init: function() {

			// call the base component's init function and create the App view
			UIComponent.prototype.init.apply(this, arguments);

			this.history = new History();

			// set the device model
			this.setModel(models.createDeviceModel(), "device");

			// create the views based on the url/hash
			//this.getRouter().initialize();

			this.oNav = ShellNavigation.getInstance();
			this.oNav.registerNavigationFilter(jQuery.proxy(this._handleEmptyHash, this));
			this.oNav.init(jQuery.proxy(this.doHashChange, this));

		},

		/*
		 * Sets application container based on information in URL hash.
		 *
		 * This is a callback registered with NavService. It's triggered
		 * whenever the url (or the hash fragment in the url) changes.
		 *
		 * NOTE: when this method is called, the new URL is already in the
		 *       address bar of the browser. Therefore back navigation is used
		 *       to restore the URL in case of wrong navigation or errors.
		 *
		 * @public
		 */
		doHashChange: function(sShellHash, sAppPart, sOldShellHash, sOldAppPart, oParseError) {

			var that = this,
				iOriginalHistoryLength,
				sFixedShellHash;

			this.lastApplicationFullHash = sOldAppPart ? sOldShellHash + sOldAppPart : sOldShellHash;

			if (oParseError) {
				throw "oParseError"; //this.hashChangeFailure(this.history.getHistoryLength(), oParseError.message, null, "sap.ushell.renderers.fiori2.Shell.controller", false);
			}

			// save current history length to handle errors (in case)
			iOriginalHistoryLength = this.history.getHistoryLength();

			// track hash change
			this.history.hashChange(sShellHash, sOldShellHash);

			sShellHash = this.fixShellHash(sShellHash);

			this._resolveHashFragment(sShellHash).done(function(oResolvedHashFragment, oParsedShellHash) {

				var sIntent = oParsedShellHash ? oParsedShellHash.semanticObject + "-" + oParsedShellHash.action : "",
					sTargetUi5ComponentName = oResolvedHashFragment && oResolvedHashFragment.ui5ComponentName;

				// !! oExistingPage = that._getExistingAppAndDestroyIfNotRoot(sIntent);

				// fire the _prior.newUI5ComponentInstantion event before creating the new component instance, so that
				// the ApplicationContainer can stop the router of the current app (avoid inner-app hash change notifications)
				//sap.ui.getCore().getEventBus().publish("ApplicationContainer", "_prior.newUI5ComponentInstantion", {
				//	name: sTargetUi5ComponentName
				//});

				// Wenn eine App geladen werden soll !?!?
				that._initiateApplication(oResolvedHashFragment, sShellHash, oParsedShellHash, iOriginalHistoryLength);

				// Wenn der RootIntent geldan werden soll !?!?

			});

		},
		/*
		 * Callback registered with NavService. Triggered on navigation requests
		 *
		 * @param {string} sShellHash
		 *     the hash fragment to parse (must start with "#")
		 *
		 * @returns {jQuery.Deferred.promise}
		 *     a promise resolved with an object containing the resolved hash
		 *     fragment (i.e., the result of
		 *     {@link sap.ushell.services.NavTargetResolution#resolveHashFragment}),
		 *     the parsed shell hash obtained via
		 *     {@link sap.ushell.services.URLParsing#parseShellHash},
		 *     and a boolean value indicating whether application dependencies <b>and</b> core-ext-light were loaded earlier.
		 *     The promise is rejected with an error message in case errors occur.
		 */
		_resolveHashFragment: function(sShellHash) {

			var oResolvedHashFragment,
				oParsedShellHash = URLParser.getInstance().parseShellHash(sShellHash),
				oDeferred = new jQuery.Deferred();

			setTimeout(function() {
				oResolvedHashFragment = {
					applicationType: "URL",
					additionalInformation: "SAPUI5.Component=launchpadder",
					id: "application-Shell-home-component", //oComponentProperties.id = "application-" + oParsedShellHash.semanticObject + "-" + oParsedShellHash.action + "-component";
					url: "./", //url: "./apps/demoapp/webapp",
					loadCoreExt: false,
					loadDefaultDependencies: false,
					applicationDependencies: {
						self: {
							"name": "launchpadder"
						},
						asyncHints: {
							"libs": [{
								"name": "sap.ui.core"
							}, {
								"name": "sap.ui.unified"
							}]
						}
					},
					name: "launchpadder",
					ui5ComponentName: "launchpadder",
					text: "The demo App",
					navigationMode: "embedded"
				};

				// jQuery.sap.registerModulePath("worklist", "./apps/worklist/webapp/");
				// jQuery.sap.registerModulePath("sap.ui.demo.worklist", "./apps/worklist/webapp/");
				// var sURL = jQuery.sap.getModulePath("worklist");

				// oResolvedHashFragment = {
				// 	title: "This is my Worklist",
				// 	name: "worklist",
				// 	url: sURL
				// };

				oDeferred.resolve(oResolvedHashFragment, oParsedShellHash);

			}, 0);

			return oDeferred.promise();
		},

		_initiateApplication: function(oResolvedHashFragment, sFixedShellHash, oParsedShellHash, iOriginalHistoryLength) {

			if (oResolvedHashFragment.text) {
				window.document.title = oResolvedHashFragment.text;
			} else {
				jQuery.sap.log.debug(
					"Shell controller._initiateApplication: the title of the window is not changed because most probably the application was resolved with undefined"
				);
			}

			try {
				this._navigate(oParsedShellHash, sFixedShellHash, oResolvedHashFragment);
			} catch (oExc) {
				if (oExc.stack) {
					jQuery.sap.log.error("Application initialization (Intent: \n" + sFixedShellHash + "\n failed due to an Exception:\n" + oExc.stack);
				}
			} finally {}
		},

		/**
		 * Performs navigation based on the given resolved hash fragment.
		 *
		 * @param {object} oParsedShellHash
		 *     the parsed shell hash obtained via
		 *     {@link sap.ushell.services.URLParsing} service
		 * @param {string} sFixedShellHash
		 *     the hash fragment to navigate to. It must start with "#" (i.e., fixed).<br />
		 * @param {object} oMetadata
		 *     the metadata object obtained via
		 *     {@link sap.ushell.services.AppConfiguration#parseShellHash}
		 * @param {object} oResolvedHashFragment
		 *     the hash fragment resolved via
		 *     {@link sap.ushell.services.NavTargetResolution#resolveHashFragment}
		 */
		_navigate: function(oParsedShellHash, sFixedShellHash, oResolvedHashFragment) {

			var that = this,
				sRootIntent = this.getModel("shellModel").getProperty("/rootIntent");

			/*
			 * A null navigationMode is a no-op, it indicates no navigation
			 * should occur. However, we need to restore the current hash to
			 * the previous one. If coldstart happened (history has only one
			 * entry), we go to the shell home.
			 */
			//if (sNavigationMode === null) {
			//if (this._isColdStart()) {
			//	hasher.setHash("Ups");
			//	return;
			//}
			//}

			var sAppId = '-' + oParsedShellHash.semanticObject + '-' + oParsedShellHash.action;

			var bIsNavToHome = sFixedShellHash === "#" || (sRootIntent && sRootIntent === oParsedShellHash.semanticObject + "-" +
				oParsedShellHash.action);

			// maybe restore hash...

			//this._createComponent(oResolvedHashFragment).done(function() {
	
				var oComponent = this._createComponent(oResolvedHashFragment);

				var sShellComponentId = this.getId();//this.getOwnerComponent().getId();

				var oAppContainer = this.byId("__component0---rootApp--launchpadderShell");//sap.ui.component(sShellComponentId);

				//var oAppContainer = that.byId(sShellComponentId + "---rootApp--launchpadderShell");

				var oComponentContainer = new sap.ui.core.ComponentContainer({
					component: oComponent
				});
				
				//oAppContainer.setContainer(oComponentContainer);
				oAppContainer.destroyContent();
				oAppContainer.addContent(oComponentContainer);
				//oContainer.placeAt(sShellComponentId + "---rootApp--launchpadderShell", "only");

			//});

			return;
		},

		_createComponent: function(oComponentProperties) {
			var oDeferred = new jQuery.Deferred()
				//UI5ComponentLoader & UI5ComponentHandle !?!!?
			return sap.ui.component(oComponentProperties)
				/*.then(function(oComponent) {
								oDeferred.resolve(oComponent);
							}, function(vError) {
								var sMsg = "Failed to load UI5 component with properties '" + JSON.stringify(oComponentProperties) + "'.",
									vDetails;
								if (typeof vError === "object" && vError.stack) {
									vDetails = vError.stack;
								} else {
									vDetails = vError;
								}
								jQuery.sap.log.error(sMsg, vDetails, "sap.ushell.services.Ui5ComponentLoader");
								oDeferred.reject(vError);
							});
				*/
			return oDeferred.promise();
		},

		_handleEmptyHash: function(sHash) {
			var sDefaultHash = this.getModel("shellModel").getProperty("/rootIntent");
			sHash = (typeof sHash === "string") ? sHash : "";
			sHash = sHash.split("?")[0];
			if (sHash.length === 0) {
				if (sDefaultHash) {
					setTimeout(function() {
						hasher.setHash(sDefaultHash);
					}, 0);
					return "Abandon"; //ShellNavigationHashChanger stops to process the navigation. By setting the hash to rootIntent, we trigger another re-routing
				}
			}
			return "Continue";
		},

		fixShellHash: function(sShellHash) {
			if (!sShellHash) {
				sShellHash = '#';
			} else if (sShellHash.charAt(0) !== '#') {
				sShellHash = '#' + sShellHash;
			}
			return sShellHash;
		},

		/**
		 * Callback registered with NavService. Triggered on navigation requests
		 *
		 * A cold start state occurs whenever the user has previously opened the window.
		 * - page is refreshed
		 * - URL is pasted in an existing window
		 * - user opens the page and pastes a URL
		 *
		 * @return {boolean} whether the application is in a cold start state
		 */
		_isColdStart: function() {
			if (this.history.getHistoryLength() <= 1) { // one navigation: coldstart!
				return true;
			}
			this._isColdStart = function() {
				return false;
			};
			return false;
		},

		/**
		 * The component is destroyed by UI5 automatically.
		 * In this method, the ListSelector and ErrorHandler are destroyed.
		 * @public
		 * @override
		 */
		destroy: function() {
			// call the base component's destroy function
			UIComponent.prototype.destroy.apply(this, arguments);
		},

		/**
		 * This method can be called to determine whether the sapUiSizeCompact or sapUiSizeCozy
		 * design mode class should be set, which influences the size appearance of some controls.
		 * @public
		 * @return {string} css class, either 'sapUiSizeCompact' or 'sapUiSizeCozy' - or an empty string if no css class should be set
		 */
		getContentDensityClass: function() {
			if (this._sContentDensityClass === undefined) {
				// check whether FLP has already set the content density class; do nothing in this case
				if (jQuery(document.body).hasClass("sapUiSizeCozy") || jQuery(document.body).hasClass("sapUiSizeCompact")) {
					this._sContentDensityClass = "";
				} else if (!Device.support.touch) { // apply "compact" mode if touch is not supported
					this._sContentDensityClass = "sapUiSizeCompact";
				} else {
					// "cozy" in case of touch support; default for most sap.m controls, but needed for desktop-first controls like sap.ui.table.Table
					this._sContentDensityClass = "sapUiSizeCozy";
				}
			}
			return this._sContentDensityClass;
		}
	});

});