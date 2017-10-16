sap.ui.define([],
	function() {
		"use strict";
		var instance;

		var URLParser = function() {

			this.reValidShellPart = /^(([A-Za-z0-9_\/]+)-([A-Za-z0-9_\/\-]+)(~([A-Z0-9a-z=+\/]+))?)?([?]([^&]|(&[^\/]))*&?)?$/;

			this.getHash = function(sURL) {
				/*jslint regexp : true*/
				var re = /#(.*)/,
					match = re.exec(sURL);
				if (match) {
					return match[1];
				}
				return undefined;
			};

			this.parseParameters = function(sParams) {
				if (!sParams) {
					return {};
				}
				return jQuery.sap.getUriParameters(sParams).mParams || {};
			};

			this.paramsToString = function(oParams) {
				return this._paramsToString(oParams, "&", "=");
			};

			this.parseShellHash = function(sHash) {
				/*jslint regexp : true*/
				var re = this.reValidShellPart,
					oSplitHash,
					sSemanticObject,
					sAction,
					sContext,
					sParams,
					match,
					pm;
				if (!sHash) {
					return undefined;
				}
				// split shell-hash and app-specific parts first
				oSplitHash = this.splitHash(sHash);

				match = re.exec(oSplitHash.shellPart);
				if (match) {
					sSemanticObject = match[2];
					sAction = match[3];
					sContext = match[5];
					sParams = match[6];
					pm = this.parseParameters(sParams);
					return {
						semanticObject: sSemanticObject,
						action: sAction,
						contextRaw: sContext,
						params: pm,
						appSpecificRoute: oSplitHash.appSpecificRoute
					};
				}
				if (oSplitHash.appSpecificRoute) {
					return {
						semanticObject: undefined,
						action: undefined,
						contextRaw: undefined,
						params: {},
						appSpecificRoute: oSplitHash.appSpecificRoute
					};
				}
				return undefined;
			};

			this.splitHash = function(sHash) {
				var re = /^(?:#|)([\S\s]*?)(&\/[\S\s]*)?$/,
					aMatch,
					sShellPart,
					sAppSpecificRoute;

				if (sHash === undefined || sHash === null || sHash === "") {
					return {};
				}
				// break down hash into parts
				// "#SO-ABC~CONTXT?ABC=3A&DEF=4B&/detail/1?A=B");
				aMatch = re.exec(sHash);
				sShellPart = aMatch[1];
				if (sShellPart !== "" && !this.reValidShellPart.test(sShellPart)) {
					return {};
				}
				sAppSpecificRoute = aMatch[2];
				if (sShellPart || sAppSpecificRoute) {
					return {
						shellPart: sShellPart,
						appSpecificRoute: sAppSpecificRoute
					}; // ,"&/detail/1?A=B");
				}
				return {};
			};

			this.constructShellHash = function(oShellHash) {
				var shellPart,
					paramsCopy,
					result,
					i = null,
					k,
					lst = [],
					first = "?",
					a = null;
				if (!oShellHash) {
					return "";
				}
				// align lack of target
				if (!oShellHash.target) {
					oShellHash.target = {};
					oShellHash.target.semanticObject = oShellHash.semanticObject;
					oShellHash.target.action = oShellHash.action;
					oShellHash.target.contextRaw = oShellHash.contextRaw;
				}
				if (oShellHash.target.shellHash || oShellHash.target.shellHash === "") {
					result = this._stripLeadingHash(oShellHash.target.shellHash);
					return this._appendIf(result, oShellHash.appSpecificRoute);
				}
				// reconstruct shell part
				if (oShellHash.target.semanticObject && oShellHash.target.action) {
					shellPart = oShellHash.target.semanticObject + "-" + oShellHash.target.action.replace(/[?].*/, "");
				} else {
					return this._appendIf("", oShellHash.appSpecificRoute);
				}

				if (oShellHash.target.contextRaw) {
					shellPart += "~" + oShellHash.target.contextRaw;
				}
				first = "?";
				a = null;
				lst = [];
				for (a in oShellHash.params) {
					if (oShellHash.params.hasOwnProperty(a)) {
						lst.push(a);
					}
				}
				paramsCopy = (oShellHash.params && JSON.parse(JSON.stringify(oShellHash.params))) || {};
				if (oShellHash.appStateKey) {
					lst.push("sap-xapp-state");
					paramsCopy["sap-xapp-state"] = oShellHash.appStateKey;
				}
				lst.sort();
				for (k = 0; k < lst.length; k = k + 1) {
					a = lst[k];
					if (jQuery.isArray(paramsCopy[a])) {
						if (paramsCopy[a].length > 1) {
							jQuery.sap.log.error(
								"Array startup parameters violate the designed intent of the Unified Shell Intent, use only single-valued parameters!");
						}
						for (i = 0; i < paramsCopy[a].length; i = i + 1) {
							shellPart += first + encodeURIComponent(a) + "=" + encodeURIComponent(paramsCopy[a][i]);
							first = "&";
						}
					} else {
						shellPart += first + encodeURIComponent(a) + "=" + encodeURIComponent(paramsCopy[a]);
						first = "&";
					}
				}
				return this._appendIf(shellPart, oShellHash.appSpecificRoute);
			};
			
			this._paramsToString = function(oParams, sDelimiter, sAssign) {
				var first,
					a,
					k,
					i,
					lst,
					shellPart = "";
				first = "";
				a = null;
				lst = [];
				for (a in oParams) {
					if (oParams.hasOwnProperty(a)) {
						lst.push(a);
					}
				}
				lst.sort();
				for (k = 0; k < lst.length; k = k + 1) {
					a = lst[k];
					if (jQuery.isArray(oParams[a])) {
						for (i = 0; i < oParams[a].length; i = i + 1) {
							shellPart += first + encodeURIComponent(a) + sAssign + encodeURIComponent(oParams[a][i]);
							first = sDelimiter;
						}
					} else {
						shellPart += first + encodeURIComponent(a) + sAssign + encodeURIComponent(oParams[a]);
						first = sDelimiter;
					}
				}
				return shellPart;
			};

			this._stripLeadingHash = function(sHash) {
				if (sHash[0] === '#') {
					return sHash.substring(1);
				}
				return sHash;
			};

			this._appendIf = function(sUrl, app) {
				if (app) {
					return sUrl + app;
				}
				return sUrl;
			};

		};

		return {
			getInstance: function() {
				if (!instance) {
					instance = new URLParser();
				}
				return instance;
			}
		};
	});