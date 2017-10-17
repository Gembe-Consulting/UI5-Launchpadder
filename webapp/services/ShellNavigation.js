sap.ui.define([
    "./ShellNavigationHashChanger"
], function (ShellNavigationHashChanger) {
    "use strict";
    
	var _oShellNavigation;
	
    var ShellNavigation = function(oContainerInterface, sParameters, oServiceConfiguration) {

        var oServiceConfig = oServiceConfiguration && oServiceConfiguration.config;

        // instantiate and exchange the HashChanger from UI5
        this.hashChanger = new ShellNavigationHashChanger(oServiceConfig);

        /**
         * Returns a boolean value indicating whether only the first navigation
         * occcurred.
         *
         * @returns {boolean}
         *   Whether the first navigation occurred (true) or a successive
         *   navigation occurred (false).
         *
         * @see {@link sap.ushell.services.ShellNavigationHashChanger#isInitialNavigation}
         * @private
         */
        this.isInitialNavigation = function () {
            return this.hashChanger.isInitialNavigation();
        };

// private methods
        /**
         * Returns a string which can be put into the DOM (e.g. in a link tag)
         * Please use CrossApplicationNavigation service and do not invoke this method directly
         * if you are an application.
         *
         * @param {Object} oArgs
         *     object encoding a semantic object and action
         *     e.g.:
         *     <pre>
         *     {
         *        target: {
         *            semanticObject: "AnObject",
         *            action: "Action"
         *        },
         *        params: {
         *            A: "B"
         *        }
         *     }
         *     </pre>
         *
         *     or
         *
         *     <pre>
         *     {
         *         target: {
         *             shellHash: "SO-36&jumper=postman"
         *         }
         *     }
         *     </pre>
         * @param {boolean} [bVerbose]
         *    whether the response should be returned in verbose format. If
         *    this flag is set to true, this function returns an object
         *    instead of a string.
         * @param {object} [oComponent]
         *    an optional instance of sap.ui.core.UIComponent
         * @param {boolean} [bAsync]
         *    indicates whether the method should return the result
         *    asynchronously. When set to <code>true</code>, the method
         *    returns a jQuery Deferred object that is resolved only after
         *    the URLShortening save operation is completed.
         *
         * @returns {object}
         *    <p>a string that can be put into an href attribute of an
         *    HTML anchor.  The returned string will always start with a
         *    hash character.</p>
         *
         *    <p>
         *    In case the <b>bVerbose</b> parameter is set to true, an
         *    object that wraps the result string will be returned
         *    instead:
         *    <pre>
         *    { hash : {string},
         *      params : {object}
         *      skippedParams : {object}
         *    }
         *    </pre>
         *    </p>
         *
         * where:
         * <ul>
         * <li><code>params</code> is an object containing non-truncated parameters</li>
         * <li><code>skippedParams</code> is an object containing truncated parameters if truncation occurred or undefined if not</li>
         * </ul>
         *
         * @methodOf sap.ushell.services.ShellNavigation#
         * @name hrefForExternal
         * @since 1.15.0
         * @private
         */
        this.hrefForExternal = function (oArgs, bVerbose, oComponent, bAsync) {
            return this.hashChanger.hrefForExternal(oArgs, bVerbose, oComponent, bAsync);
        };

        /**
         * returns a string which can be put into the DOM (e.g. in a link tag)
         * given an app specific hash suffix,
         * (it may shorten the app specific parts of the url to fit browser restrictions)
         *
         * @param {string} sAppHash Applicatiom hash
         * @returns {string} a string which can be put into the link tag,
         *          containing the current shell hash as prefix and the
         *          specified application hash as suffix
         *
         * example: hrefForAppSpecificHash("View1/details/0/") returns
         * "#MyApp-Display&/View1/details/0/"
         * @methodOf sap.ushell.services.ShellNavigation#
         * @name parseShellHash
         * @since 1.15.0
         * @private
         */
        this.hrefForAppSpecificHash = function (sAppHash) {
            return this.hashChanger.hrefForAppSpecificHash(sAppHash);
        };

        /**
         * compact the parameter object, if required
         * a number of parameters will be removed, instead a corresponding "sap-intent-param"
         * containing a key of an appstate representing the removed parameters will be
         * inserted
         *
         * @param {object} oParams
         *   A parameter object
         * @param {Array} [aRetainedParameters]
         *   An array of string value of parameters which shall not be compacted
         *   The array may contains a *-terminated string, which will match and strings with the same
         *   prefix ( e.g. "sap-*" will match "sap-ushell", "sap-wd", "sap-" etc. )
         * @param {Object} [oComponent]
         *  optional, a SAP UI5 Component
         * @param {boolean} [bTransient] whether an transient appstate is sufficient
         * @returns {promise} a promise, whose first argument of resolve is
         * @protected
         */
        this.compactParams = function (oParams, aRetainedParameters, oComponent, bTransient) {
            return this.hashChanger.compactParams(oParams, aRetainedParameters, oComponent, bTransient);
        };

        /**
         * Navigate to an external target
         *
         * @param {Object} oArgs configuration object describing the target
         *
         *  e.g. { target : { semanticObject : "AnObject", action: "Action" },
         *         params : { A : "B" } }
         *
         * constructs sth like    http://....ushell#AnObject-Action?A=B ....
         * and navigates to it.
         * @param {Object} oComponent optional
         *      a SAP UI5 Component
         * @param {boolean} bWriteHistory
         *      writeHistory whether to create a history record (true, undefined) or replace the hash (false)
         *
         * @private
         */
        this.toExternal = function (oArgs, oComponent, bWriteHistory) {
            this.hashChanger.toExternal(oArgs, oComponent, bWriteHistory);
        };

        /**
         * Constructs the full shell hash and
         * sets it, thus triggering a navigation to it
         * @param {string} sAppHash specific hash
         * @param {boolean} bWriteHistory if true it adds a history entry in the browser if not it replaces the hash
         * @private
         */
        this.toAppHash = function (sAppHash, bWriteHistory) {
            this.hashChanger.toAppHash(sAppHash, bWriteHistory);
        };

// Lifecycle methods
        /**
         * Initializes ShellNavigation
         *
         * This function should be used by a custom renderer in order to implement custom navigation.
         * Do not use this function for developing Fiori applications.
         *
         * This method should be invoked by the Shell in order to:
         * - Register the event listener
         * - Register the container callback for the (currently single) ShellHash changes.
         *
         * Signature of the callback function(
         *         sShellHashPart,  // The hash part on the URL that is resolved and used for application loading
         *         sAppSpecificPart // Typically ignored
         *         sOldShellHashPart, // The old shell hash part, if exist
         *         sOldAppSpecificPart, // The old app hash part, if exist
         *
         * @param {function} fnShellCallback The callback method for hash changes
         * @returns {object} this
         * @public
         * @alias sap.ushell.services.ShellNavigation#init
         */
        this.init = function (fnShellCallback) {
            hasher.prependHash = "";
            sap.ui.core.routing.HashChanger.replaceHashChanger(this.hashChanger);
            this.hashChanger.initShellNavigation(fnShellCallback);
            return this;
        };

        /**
         * The navigation filter statuses that should be returned by a navigation filter
         * @see sap.ushell.services.ShellNavigation.registerNavigationFilter
         * @alias sap.ushell.services.ShellNavigation#registerNavigationFilter
         *
         * Continue - continue with the navigation flow
         * Abandon - stop the navigation flow, and revert to the previous hash state
         * Custom - stop the navigation flow, but leave the hash state as is. The filter should use this status
         *  to provide alternative navigation handling
         *
         */
        this.NavigationFilterStatus = this.hashChanger.NavigationFilterStatus;

        /**
         * Register the navigation filter callback function.
         * A navigation filter provides plugins with the ability to intervene in the navigation flow,
         * and optionally to stop the navigation.
         *
         * The callback has to return @see sap.ushell.services.ShellNavigation.NavigationFilterStatus
         * The callback has to return @alias sap.ushell.services.ShellNavigation#registerNavigationFilter
         *
         * Use <code>Function.prototype.bind()</code> to determine the callback's <code>this</code> or
         * some of its arguments.
         *
         * @param {Object} fnFilter
         *  navigation filter function
         */
        this.registerNavigationFilter = function (fnFilter) {
            this.hashChanger.registerNavigationFilter(fnFilter);
        };
    }; // ShellNavigation

    return {
        getInstance: function () {
            if (!_oShellNavigation) {
                _oShellNavigation = new ShellNavigation();
            }
            return _oShellNavigation;
        }
    };

}, true /* bExport */);