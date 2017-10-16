sap.ui.define([
	"sap/ui/core/routing/HashChanger",
	"sap/ui/thirdparty/hasher",
	"./URLParser"
], function(HashChanger, hasher, URLParser) {
	"use strict";
	var NavigationHashChanger = HashChanger.extend(null, {
		constructor: function(oConfig) {

			this.oServiceConfig = oConfig;
			sap.ui.core.routing.HashChanger.apply(this);

			//this.oURLShortening = sap.ushell.Container.getService("URLShortening");
			
			this._initializedByShellNav = false;
			this._fnShellCallback = null;
			this._appHashPrefix = "&/";
			this._hashPrefix = "#";

			/**
			 * obtain the current shell hash (with #) urlDecoded
			 * Shortened(!)
			 * @return {string} shell hash
			 */
			this._getCurrentShellHash = function() {
				var res = this._splitHash(hasher.getHash());
				return {
					hash: "#" + ((res && res.shellPart) ? res.shellPart : "")
				};
				//                return "#" + ((res && res.shellPart) ? res.shellPart : "");
			};

			/**
			 * internal, construct the next hash, with #
			 * shortened(!)
			 * @param {string} sAppSpecific Application specific hash
			 * @return {string} constructed full hash
			 */
			this._constructHash = function(sAppSpecific) {
				var o = this._getCurrentShellHash();
				o.hash = o.hash + sAppSpecific;
				return o;
			};

			/**
			 * internal, without #
			 * @param {object} oShellHash shell hash concept
			 * @return {string} return constructed string
			 */
			this._constructShellHash = function(oShellHash) {
				return URLParser.getInstance().constructShellHash(oShellHash);
			};

			/** 
			 * split a shell hash into app and shell specific part
			 * this method is deliberately restrictive to work only on proper hashes
			 *  @_ate
			 *  @returns <code>null</code>, if sHash is not a valid hash (not parseable);
			 *      otherwise an object with properties <code>shellPart</code> and <code>appSpecificRoute</code>
			 *      the properties are <code>null</code> if sHash is falsy
			 */
			this._splitHash = function(sHash) {
				var oShellHash,
					oShellHashParams,
					sAppSpecificRoute;

				if (sHash === undefined || sHash === null || sHash === "") {
					return {
						shellPart: null,
						appSpecificRoute: null,
						intent: null,
						params: null
					};
				}
				// break down hash into parts
				// "#SO-ABC~CONTXT?ABC=3A&DEF=4B&/detail/1?A=B");
				oShellHash = URLParser.getInstance().parseShellHash(sHash);
				if (oShellHash === undefined || oShellHash === null) {
					return null;
				}

				oShellHashParams = (oShellHash.params && !jQuery.isEmptyObject(oShellHash.params)) ? oShellHash.params : null;
				sAppSpecificRoute = oShellHash.appSpecificRoute;
				oShellHash.appSpecificRoute = undefined;
				return {
					shellPart: this._stripLeadingHash(this._constructShellHash(oShellHash)) || null,
					appSpecificRoute: sAppSpecificRoute || null, // ,"&/detail/1?A=B");
					intent: (oShellHash.semanticObject && oShellHash.action && (oShellHash.semanticObject + "-" + oShellHash.action + (oShellHash.contextRaw ||
						""))) || null,
					params: oShellHashParams
				};
			};

			/**
			 * internal, central navigation hook that trigger hash change
			 * triggers events and sets the hash
			 * @param {string} sFullHash full shell hash
			 * @param {string} sAppHash application specific hash
			 * @param {boolean} bWriteHistory whether to create a history record (true, undefined) or replace the hash (false)
			 */
			this._setHash = function(sFullHash, sAppHash, bWriteHistory) {
				hasher.prependHash = "";
				sFullHash = this._stripLeadingHash(sFullHash);
				sAppHash = sAppHash || "";
				if (bWriteHistory === undefined) {
					bWriteHistory = true;
				}
				// don't call method on super class
				// we set the full hash and fire the events for the app-specific part only
				// this is necessary for consistency of all events; hashSet and hashReplaced are
				// evaluated by sap.ui.core.routing.History
				if (bWriteHistory) {
					this.fireEvent("hashSet", {
						sHash: sAppHash
					});
					hasher.setHash(sFullHash);
				} else {
					this.fireEvent("hashReplaced", {
						sHash: sAppHash
					});
					hasher.replaceHash(sFullHash);
				}
			};

			this._stripLeadingHash = function(sHash) {
				if (sHash[0] === '#') {
					return sHash.substring(1);
				}
				return sHash;
			};
		}
	});
	
    /**
     * Initialization for the shell navigation.
     *
     * This will start listening to hash changes and also fire a hash changed event with the initial hash.
     * @param {function} fnShellCallback Shell callback
     * @protected
     * @return {boolean} false if it was initialized before, true if it was initialized the first time
     */
    NavigationHashChanger.prototype.initNavigation = function (fnShellCallback) {
        // this._oInitialNavigationManager = createInitialNavigationManager();

        if (this._initializedByShellNav) {
            jQuery.sap.log.error("initNavigation already called on this NavigationHashChanger instance.");
            return false;
        }

        this._fnShellCallback = fnShellCallback;

        hasher.changed.add(this.treatHashChanged, this); //parse hash changes

        if (!hasher.isActive()) {
            hasher.initialized.addOnce(this.treatHashChanged, this); //parse initial hash
            hasher.init(); //start listening for history change
        } else {
            this.treatHashChanged(hasher.getHash());
        }
        this._initializedByShellNav = true;
        return true;
    };	

   /**
     * Fires the hashchanged event, may be extended to modify the hash before firing the event
     * @param {string} newHash the new hash of the browser
     * @param {string} oldHash - the previous hash
     * @protected
     */
    ShellNavigationHashChanger.prototype.treatHashChanged = function (newHash, oldHash) {

     
        var sAppSpecificRoute,
            sOldAppSpecificRoute,
            oNewHash,
            oOldHash,
            sNewIntent,
            sOldIntent,
            sNewParameters,
            sOldParameters,
            oError,
            i,
            sFilterResult;
        newHash = this.oURLShortening.expandHash(newHash); // do synchronous expansion if possible
        oldHash = this.oURLShortening.expandHash(oldHash); // if not, the parameter remains and is expanded during NavTargetResolution
        oNewHash = this._splitHash(newHash);
        oOldHash = this._splitHash(oldHash);

        if (!oNewHash) {
            // illegal new hash; pass the full string and an error object
            oError = new Error("Illegal new hash - cannot be parsed: '" + newHash + "'");
            this.fireEvent("shellHashChanged", {
                newShellHash : newHash,
                newAppSpecificRoute : null,
                oldShellHash : (oOldHash ? oOldHash.shellPart : oldHash),
                error: oError
            });
            this._fnShellCallback(newHash, null, (oOldHash ? oOldHash.shellPart : oldHash), (oOldHash ? oOldHash.appSpecificRoute : null), oError);
            return;
        } else {
            sNewIntent = oNewHash.intent;
        }

        if (!oOldHash) {
            // illegal old hash - we are less restrictive in this case and just set the complete hash as shell part
            oOldHash = {
                shellPart: oldHash,
                appSpecificRoute: null
            };
        } else {
            sOldIntent = oOldHash.intent;
        }

        //call all navigation filters
        for (i = 0; i < this.aNavigationFilters.length; i = i + 1) {
            try {
                sFilterResult = this.aNavigationFilters[i].call(undefined, newHash, oldHash);
                if (sFilterResult === this.NavigationFilterStatus.Custom) {
                    //filter is handling navigation - stop the navigation flow.
                    return;
                }
                if (sFilterResult === this.NavigationFilterStatus.Abandon) {
                    //filter abandon this navigation, therefore we need to reset the hash and stop the navigation flow
                    this.inAbandonFlow = true;
                    hasher.replaceHash(oldHash);
                    this.inAbandonFlow = false;
                    return;
                }
                //else - continue with navigation
            } catch (e) {
                jQuery.sap.log.error("Error while calling Navigation filter! ignoring filter...", e.message, "sap.ushell.services.ShellNavigation");
            }
        }

        if (sNewIntent === sOldIntent && (oldHash !== undefined)) { // second condition holds true for initial load where we always want to trigger the shell navigation
            // app specific change only !

            if (!this._parametersChanged(oNewHash.params, oOldHash.params)) {
                sAppSpecificRoute = (oNewHash.appSpecificRoute || "  ").substring(2);  // strip &/
                sOldAppSpecificRoute = (oOldHash.appSpecificRoute || "  ").substring(2);  // strip &/
                jQuery.sap.log.info("Inner App Hash changed from '" + sOldAppSpecificRoute + "' to '" + sAppSpecificRoute + "'", null, "sap.ushell.services.ShellNavigation");
                // an empty string has to be propagated!
                this.fireEvent("hashChanged", { newHash : sAppSpecificRoute, oldHash : sOldAppSpecificRoute });
                return;
            }

            if (this.hasListeners("shellHashParameterChanged") ) {
                sNewParameters = URLParser.getInstance().paramsToString(oNewHash.params);
                sOldParameters = URLParser.getInstance().paramsToString(oOldHash.params);

                jQuery.sap.log.info("Shell hash parameters changed from '" + sOldParameters + "' to '" + sNewParameters  + "'", null, "sap.ushell.services.ShellNavigation");
                this.fireEvent("shellHashParameterChanged", { oNewParameters : oNewHash.params, oOldParameters : oOldHash.params });
                return;
            } // if there is no listener for shellHashParameterChanged then we proceed with cross app navigation
        }

        function reload(sHash) {
            // the event handler is fired before hasher.js performs the actual hash update in the browser
            // thus we must update the hash here prior to triggering reload
            // (technically, _encodeHash() of hasher.js would be more appropriate)
            window.location.hash = '#' + encodeURI(sHash);
            window.location.reload();
        }
        if (oldHash !== undefined) {
            if (this.oServiceConfig && this.oServiceConfig.reload) {
                reload(newHash);
            }
        }
        jQuery.sap.log.info("Outer shell hash changed from '" + oldHash + "' to '" + newHash + "'", null, "sap.ushell.services.ShellNavigation");
        // all Shell specific callback -> load other app !
        this.fireEvent("shellHashChanged", { newShellHash : oNewHash.shellPart, newAppSpecificRoute : oNewHash.appSpecificRoute, oldShellHash :  oOldHash.shellPart, oldAppSpecificRoute : oOldHash.appSpecificRoute});
        this._fnShellCallback(oNewHash.shellPart, oNewHash.appSpecificRoute, oOldHash.shellPart, oOldHash.appSpecificRoute);
    };
    
	return NavigationHashChanger;
}, true);