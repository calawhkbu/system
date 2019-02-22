module.exports = {
	"fields": {
		"delayCategory": {
			"fieldName": "delayCategory",
			"fieldKey": "delayCategory",
			"expression": `json_unquote(flexData.data->'$.delayCategory')`
		},
		"delayReasonRemark": {
			"fieldName": "delayReasonRemark",
			"fieldKey": "delayReasonRemark",
			"expression": `json_unquote(flexData.data->'$.delayReasonRemark')`
		},
		"totalShipments": {
			"fieldName": "totalShipments",
			"fieldKey": "totalShipments",
			"expression": "count(distinct b.bookingNo)",
			"isGroupField": true
		},
		"grossDelays": {
			"fieldName": "grossDelays",
			"fieldKey": "grossDelays",
			"expression": "sum(length(json_unquote(flexData.data->'$.delayReasonRemark')) > 0)",
			"isGroupField": true
		},
		"grossDelaysPct": {
			"fieldName": "grossDelaysPct",
			"fieldKey": "grossDelaysPct",
			"expression": "sum(length(json_unquote(flexData.data->'$.delayReasonRemark')) > 0) / count(*)",
						"numberFormat": "2dp",
			"isGroupField": true
		},
		"grossOntime": {
			"fieldName": "grossDelays",
			"fieldKey": "grossDelays",
			"expression": "count(*) - sum(length(json_unquote(flexData.data->'$.delayReasonRemark')) > 0)",
			"isGroupField": true
		},
		"grossOntimePct": {
			"fieldName": "grossOntimePct",
			"fieldKey": "grossOntimePct",
			"expression": "(count(*) - sum(length(json_unquote(flexData.data->'$.delayReasonRemark')) > 0)) / count(*)",
						"numberFormat": "2dp",
			"isGroupField": true
		},
		"netDelays": {
			"fieldName": "netDelays",
			"fieldKey": "netDelays",
			"expression": "sum(json_unquote(flexData.data->'$.isControllable'))",
			"isGroupField": true
		},
		"netDelaysPct": {
			"fieldName": "netDelaysPct",
			"fieldKey": "netDelaysPct",
			"expression": "sum(json_unquote(flexData.data->'$.isControllable')) / count(*)",
            "numberFormat": "2dp",
			"isGroupField": true
		},
		"netOntime": {
			"fieldName": "netOntime",
			"fieldKey": "netOntime",
			"expression": "count(*) - sum(json_unquote(flexData.data->'$.isControllable'))",
			"isGroupField": true
		},
		"netOntimePct": {
			"fieldName": "netOntimePct",
			"fieldKey": "netOntimePct",
			"expression": "(count(*) - sum(json_unquote(flexData.data->'$.isControllable'))) / count(*)",
            "numberFormat": "2dp",
			"isGroupField": true
		},
		"departureRegion": {
			"fieldName": "departureRegion",
			"fieldKey": "departureRegion",
			"expression":
			`ifnull(
				(
					select
						max(cg.name)
					from
						customGroupCriteria cgc, customGroup cg
					where
						cg.id = cgc.customGroupId
						and cg.ownerEntity = 'customer'
						and cg.ownerEntityId = 0
						and cg.category = 'Region'
						and cgc.groupValue = b.polCountry
				),
				'_N/A'
			)
			`,
			disabled: true,
			/* "filter": {
	            "api": {
	                "url": "/api/customGroup",
	                "mapping": {
	                	"key": "name",
	                	"primaryText": "name"
	                },
	                "params": {
	                	"filter": {
		                	"category": "Region",
		                	"ownerEntity": "customer",
		                	"ownerEntityId": 0
	                	}
	                }

	            },
	            "type": "list",
	            "field": "departureRegion"
			} */
		},
		"arrivalRegion": {
			"fieldName": "arrivalRegion",
			"fieldKey": "arrivalRegion",
			"expression":
			`
			ifnull(
				(
					select
						max(cg.name)
					from
						customGroupCriteria cgc, customGroup cg
					where
						cg.id = cgc.customGroupId
						and cg.ownerEntity = 'customer'
						and cg.ownerEntityId = 0
						and cg.category = 'Region'
						and cgc.groupValue = b.podCountry
				),
				'_N/A'
			)
			`,
			disabled: true,
			/* "filter": {
	            "api": {
	                "url": "/api/customGroup",
	                "mapping": {
	                	"key": "name",
	                	"primaryText": "name"
	                },
	                "params": {
	                	"filter": {
		                	"category": "Region",
		                	"ownerEntity": "customer",
		                	"ownerEntityId": 0
	                	}
	                }

	            },
	            "type": "list",
	            "field": "arrivalRegion"
			} */
		},
		"departureSubRegion": {
			"fieldName": "departureSubRegion",
			"fieldKey": "departureSubRegion",
			"expression":
			`ifnull(
				(
					select
						max(cg.name)
					from
						customGroupCriteria cgc, customGroup cg
					where
						cg.id = cgc.customGroupId
						and cg.ownerEntity = 'customer'
						and cg.ownerEntityId = 0
						and cg.category = 'Sub-Region'
						and cgc.groupValue = b.polCountry
				),
				'_N/A'
			)
			`,
			disabled: true,
			/* "filter": {
	            "api": {
	                "url": "/api/customGroup",
	                "mapping": {
	                	"key": "name",
	                	"primaryText": "name"
	                },
	                "params": {
	                	"filter": {
		                	"category": "Sub-Region",
		                	"ownerEntity": "customer",
		                	"ownerEntityId": 0
	                	}
	                }

	            },
	            "type": "list",
	            "field": "departureSubRegion"
			} */
		},
		"arrivalSubRegion": {
			"fieldName": "arrivalSubRegion",
			"fieldKey": "arrivalSubRegion",
			"expression":
			`ifnull(
				(
					select
						max(cg.name)
					from
						customGroupCriteria cgc, customGroup cg
					where
						cg.id = cgc.customGroupId
						and cg.ownerEntity = 'customer'
						and cg.ownerEntityId = 0
						and cg.category = 'Sub-Region'
						and cgc.groupValue = b.polCountry
					),
					'_N/A'
				)
			`,
			disabled: true,
			/* "filter": {
	            "api": {
	                "url": "/api/customGroup",
	                "mapping": {
	                	"key": "name",
	                	"primaryText": "name"
	                },
	                "params": {
	                	"filter": {
		                	"category": "Sub-Region",
		                	"ownerEntity": "customer",
		                	"ownerEntityId": 0
	                	}
	                }

	            },
	            "type": "list",
	            "field": "arrivalSubRegion"
			} */
		}
	},
	"filters": {
		"departureRegion": {
			"expression":
			`(select max(cg.name) from customGroupCriteria cgc, customGroup cg
						where cg.id = cgc.customGroupId
						and cg.ownerEntity = 'customer'
						and cg.ownerEntityId = 0
						and cg.category = 'Region'
                        and cgc.groupValue = b.polCountry) in (:departureRegion)
			`,
            fields: {
               "departureRegion": {
                 type: "array"
               }
            }
		},
		"arrivalRegion": {
			"expression":
			`(select max(cg.name) from customGroupCriteria cgc, customGroup cg
						where cg.id = cgc.customGroupId
						and cg.ownerEntity = 'customer'
						and cg.ownerEntityId = 0
						and cg.category = 'Region'
                        and cgc.groupValue =  b.podCountry) in (:arrivalRegion)
			`,
            fields: {
               "arrivalRegion": {
                 type: "array"
               }
            }
		},
		"departureSubRegion": {
			"expression":
			`(select max(cg.name) from customGroupCriteria cgc, customGroup cg
											where cg.id = cgc.customGroupId
											and cg.ownerEntity = 'customer'
											and cg.ownerEntityId = 0
											and cg.category = 'Sub-Region'
                                            and cgc.groupValue =  b.polCountry) in (:departureSubRegion)
			`,
            fields: {
               "departureSubRegion": {
                 type: "array"
               }
            }
		},
		"arrivalSubRegion": {
			"expression":
			`(select max(cg.name) from customGroupCriteria cgc, customGroup cg
											where cg.id = cgc.customGroupId
											and cg.ownerEntity = 'customer'
											and cg.ownerEntityId = 0
											and cg.category = 'Sub-Region'
                                            and cgc.groupValue = b.podCountry) in (:arrivalSubRegion)
			`,
            fields: {
               "arrivalSubRegion": {
                 type: "array"
               }
            }
		}
	},
	"definitionMaps": {
		"reporting-tool/metadata-1": [
			"departureRegion",
			"arrivalRegion",
			"weDeliver",
			"serviceLevel",
			"serviceType",
			"isControllable",
			"delayRemarksFromOrigin",
			"delayRemarksFromDestination",
			"delayReasonCode",
			"delayReasonRemark",
			"delayCategory"
		],
		"uber": [
			"departureRegion",
			"departureSubRegion",
			"arrivalRegion",
			"arrivalSubRegion"
		],
		"booking-details": [
			"departureRegion", "departureSubRegion", "arrivalRegion", "arrivalSubRegion"
		],
		"alerts": [
			"departureRegion", "departureSubRegion", "arrivalRegion", "arrivalSubRegion"
		],
		"transaction-status-summary": [
			"departureRegion", "departureSubRegion", "arrivalRegion", "arrivalSubRegion"
		],
		"booking-details": [
			"departureRegion", "arrivalRegion",
			"weDeliver", "serviceLevel", "serviceType", "isControllable",
			"delayRemarksFromOrigin", "delayRemarksFromDestination",
			"delayReasonCode", "delayReasonRemark", "delayCategory"
		],
		"booking-summary": [
			"delayReasonRemark",
			"departureRegion", "departureSubRegion", "arrivalRegion", "arrivalSubRegion",
			"totalShipments", "grossDelays", "grossDelaysPct", "netDelays", "netDelaysPct",
			"grossOntime", "grossOntimePct", "netOntime", "netOntimePct", "delayCategory"
		],
		"purchaseOrder-details": ["departureRegion", "departureSubRegion", "arrivalRegion", "arrivalSubRegion"],
 		"uber-summary": ["departureRegion", "departureSubRegion", "arrivalRegion", "arrivalSubRegion"],
		"reporting-tool/metadata-1": ["departureRegion", "arrivalRegion", "departureSubRegion", "arrivalSubRegion" ]
	}
}
