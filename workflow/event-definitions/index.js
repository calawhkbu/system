
module.exports = {
	definitions: [
		{
			name: "update_tracking",
			persistent: true,
			sampleData: {
				modelName: "",
				oldData: {},
				data: {}
			},
			context: {
				entity: "customer",
				entityId: "data.customerId"
			},
			handlers: [
				{name: "checkETAChange"},
				{on: {"DELAY": {name: "echoData", parameters: {"remarks": "echoData from system event"}}}}
			]
		},
		{
			name: "update_billTracking",
			persistent: true,
			sampleData: {
				modelName: "",
				oldData: {},
				data: {}
			},
			context: {
				entity: "customer",
				entityId: "data.customerId"
			},
			handlers: [
				{name: "checkETAChange"},
				{name: "sendDataToThirdParty", parameters: {appId: "outbound-testing-app"}},
				{on: {
					"DELAY": {
						name: "saveAlert",
						parameters: {
							alertType: "Shipment ETA Changed",
							severity:"Medium",
							tableName:"bill",
							referenceObject:"data",
							alertCategory:"Exception",
							whereQuery:"{\"masterNo\":\"{{masterNo}}\",\"customerId\":{{customerId}} }",
							alert: "BL# {{data.masterNo}} has changed.  From {{oldData.estimatedArrivalDate | date('d M Y')}} to {{data.estimatedArrivalDate | date('d M Y')}}"}
						},
						"DATESET": {
							name: "echoData",
							parameters: {}
						}
					}
				},
				{_on: {"DELAY": {name: "sendEmail",
								parameters: {
									to: "hungchou.tai@swivelsoftware.com",
									from: "hungchou.tai@swivelsoftware.com",
									subject: "Master BL# {{data.masterNo}} has been delayed",
									text: "Old ETA was: {{oldData.estimatedArrivalDate}}.\nNew ETA is:  {{data.estimatedArrivalDate}}"
								}}}},
                {_on: {"DELAY": {name: "sendNotification",
                            parameters: {
                                roles: ["ConsigneeUser", "ForwarderUser"],
                                subject: "Master BL# {{masterNo}} has been delayed From {{oldData.estimatedArrivalDate | date('d M Y')}} to {{data.estimatedArrivalDate | date('d M Y')}}.",
                                severity: "Medium",
                                tableName: "bill",
                                primaryKey: "id",
                                customerId: "customerId",
                                type:"update_billTracking",
                                getRecords:true,
                                referenceObject:"data",
                                alertCategory:"Exception",
                                whereQuery:"{\"masterNo\":\"{{masterNo}}\",\"customerId\":{{customerId}} }",
                                email: {
                                    from: "hungchou.tai@swivelsoftware.com",
                                    to: "hungchou.tai@swivelsoftware.com",
                                    template: "bill-trackin-update",
                                    subject: "Master BL# {{masterNo}} has been delayed",
                                },
                                wechat: {
                                    publicTemplateId: 'OPENTM402244876',
                                    privateTemplateId: 'sX4vIVmYVap4hJ9GO8Ze6ReWp1hhqzQq7_QysyA3lSw',
                                    dataBinding: []
                                },
                                sms: {}
                            }
                		}}}
			]
		},
        {
            name: "update_booking",
            persistent: true,
            sampleData: {
                modelName: "",
                oldData: {},
                data: {}
            },
            context: {
                entity: "customer",
                entityId: "data.customerId"
            },
            handlers: [
                {name: "checkETAChange"},
                {on: {"DELAY": {name: "sendNotification",
                            parameters: {
                                subject: "{{modelName}}# {{data.id}} ETA has been changed from {{oldData.estimatedArrivalDate | date('d M Y')}} to {{data.estimatedArrivalDate | date('d M Y')}} ",
                                primaryKey:"id",
                                customerId:"customerId",
                                tableName:"booking",
                                alertCategory:"Exception",
                                referenceObject:"data",
                                type:"ETA update"
                            }}}},
                {name: "checkETDChange"},
                {_on: {"DELAY": {name: "sendNotification",
                            parameters: {
                                subject: "{{modelName}}# {{data.id}} ETD has been changed from {{oldData.estimatedDepartureDate | date('d M Y')}} to {{data.estimatedDepartureDate | date('d M Y')}} ",
                                primaryKey:"id",
                                customerId:"customerId",
                                tableName:"booking",
                                alertCategory:"Exception",
                                referenceObject:"data",
                                type:"ETD update"
                            }}}}
            ]
        },
		{
			name: "post_message",
			persistent: true,
			sampleData: {
				modelName: "",
				data: {}
			},
			handlers: [
				{name: "sendEmail",
				 parameters: {
							to: "{{to}}",
							from: "{{from}}",
							subject: "{{subject}}",
							text: `{{text}}`
				} }
			]
		},
		{
			name: "create_authentication",
			persistent: true,
			sampleData: {
				modelName: "",
				data: {}
			},
			handlers: [
				{name: "echoData"}
			]
		},
        {
			name: "new_booking",
			persistent: true,
			sampleData: {
				booking: {}
			},
            context: {
                entity: "customer",
                entityId: "data.customerId"
            },
			handlers: [
				{name: "bookingEmail",
				 parameters: {
				 	roles: ["ConsigneeUser", "ForwarderUser"],
				 	subject: "New booking alert {{portOfLoading}} -> {{portOfDischarge}} [{{bookingNo}}]",
				 	template: "new-booking-preview-email",
                    severity: "Medium",
                    tableName: "booking",
                    primaryKey: "id",
                    customerId: "customerId",
                    alertCategory: "Message",
					type:"New Booking",
                    email: {
                        template: "new-booking-preview-email",
                        subject: "New booking alert {{portOfLoading}} -> {{portOfDischarge}} [{{bookingNo}}]"
                    },
                    wechat: {
                        publicTemplateId: 'OPENTM402244876',
                        privateTemplateId: 'sX4vIVmYVap4hJ9GO8Ze6ReWp1hhqzQq7_QysyA3lSw',
                        dataBinding: []
                    },
                    sms: {}
				} },
				{name: "sendDataToThirdParty", parameters: {appId: "fm3k-app"}},
                {name: "partiesMissing",
                    parameters: {alertType: "Shipment missing valid customer details",
                        severity:"Medium",
                        tableName:"booking",
                        alertCategory:"Exception",
                        roles:["Consignee","Shipper"],
                        whereQuery:"{\"id\":\"{{id}}\"}",
                        alert: "\"Shipper\" or \"Consignee\" was not assigned."
                    }
                }
			]
		},
        {
			name: "echo",
			persistent: true,
			sampleData: {
				modelName: "",
				data: {}
			},
			handlers: [
				{name: "echoData", parameters: {"remarks": "echoData from system event"}}
			]
		}
	]
}
