sap.ui.define([
		"sap/ui/core/format/NumberFormat",
		"sap/ui/core/format/DateFormat",
		"sap/ui/model/type/Float",
		"sap/ui/model/type/Date",
		"sap/ui/model/type/Time"
	], function (NumberFormat, DateFormat, Float, Date, Time) {
	"use strict";

	var _oStyle = {
		shortOutput : "short",
		mediumOutput : "medium",
		longOutput : "long",
		fullOutput : "full"
	};
	var _oSapInput : {
		pattern : {
			sapDate : "yyyyMMdd",
			sapTime : "HHmmss"
		},
		constrain:{
			sapMinDate: "19700101",
			sapMaxDate: "99991231",
			sapMinTime: "000000",
			sapMaxTime: "235959",
			sapMinNumber: -9999999999.999,
			sapMaxNumber: +9999999999.999
		}

	};

	/* How to build Types
	 * Example: number type
	 *	new sap.ui.model.type.MyType(oFormatOptions?, oConstraints?)
	 *	oFormatOptions : https://sapui5.hana.ondemand.com/docs/api/symbols/sap.ui.core.format.NumberFormat.html#constructor
	 * Example: date type
	 *	new sap.ui.model.type.Date(oFormatOptions?, oConstraints?)
	 *	oFormatOptions : https://sapui5.hana.ondemand.com/docs/api/symbols/sap.ui.core.format.DateFormat.html#constructor
	 *
	 *	oConstraints : Values for constraints must use the same type as configured via oFormatOptions.source
	 */

	return {

		sapNumber : new Float({
			minIntegerDigits : 1,
			maxIntegerDigits : 10,
			minFractionDigits : 0,
			maxFractionDigits : 3,
			groupingEnabled : true
		}, {
			minimum : _oSapInput.constrain.sapMinNumber,
			maximum : _oSapInput.constrain.sapMaxNumber
		}),

		sapDate : new Date({
			source : {
				pattern : _oSapInput.pattern.sapDate,
			},
			style : _oStyle.shortOutput,
			strictParsing : true
		}, {
			minimum : _oSapInput.constrain.sapMinDate,
			maximum : _oSapInput.constrain.sapMaxDate
		}),

		sapTime : new Time({
			source : {
				pattern : _oSapInput.pattern.sapTime,
			},
			style : _oStyle.shortOutput,
			strictParsing : true
		}, {
			minimum : _oSapInput.constrain.sapMinTime,
			maximum : _oSapInput.constrain.sapMaxTime
		})

	};

});
