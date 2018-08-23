//TODO NEED TO UPDATE THE ACTUAL RULES
module.exports ={
    statusList: [
        {
            name: "Booked",
            validationRules: [
                {
                    script: "",
                    error: "newBookingError"
                }
            ],
            roles: [
                "SwivelAdmin",
                "ShipperUser",
                "ShipperAdmin",
                "ForwarderAdmin"
            ],
            generatedDate:"gDate = date(booking.createdAt); var aDate=date(booking.createdAt)",
            actualDate:"aDate = date(booking.createdAt);",
            trackingStatus:"Booked"
        },
        {
            name: "Shipping Advice Ready",
            validationRules: [
                {
                    script: "result = documentExists('Shipping Advice');",
                    error: "shippingAdviceNotFound",
                    parameters: {
                        missingFiles:['Shipping Advice']
                    }
                },
                {
                    script: "result = (date(bill.estimatedDepartureDate) <= now().addDays(bill.maxDays + 4));",
                    error: "shippingAdviceNotFound"
                }
            ],
            onEnterRule: "email(['Consignee'])",
            roles: [
                "SwivelAdmin",
                "ShipperUser",
                "ShipperAdmin",
                "ForwarderAdmin"
            ],
            action: "/document/create/shippingAdvice",
            generatedDate:"gDate = date(booking.estimatedDepartureDate); gDate= gDate.addDays(-2)",
        },
        {
            name: "Shipping Advice Confirmed",
            validationRules: [
                {
                    script: "result = documentConfirmed('Shipping Advice')",
                    error: "confirmShippingAdvice",
                    parameters: {
                        missingFiles:['Shipping Advice']
                    }
                }
            ],
            onEnterRule: "email(['Consignee', 'Agent', 'Shipper', 'Forwarder'])",
            roles: [
                "SwivelAdmin",
                "ConsigneeAdmin",
                "ShipperUser"
            ],
            action: "/document/confirm/shippingAdvice",
            generatedDate:"gDate = date(booking.estimatedDepartureDate); gDate= gDate.addDays(-1)",
        },
        {
            name: "Shipping Instructions Ready",
            validationRules: [
                {
                    script: "result = documentExists('Shipping Instructions')",
                    error: "shippingInstructionsNotFound",
                    parameters: {
                        missingFiles:['Shipping Instructions']
                    }
                }
            ],
            onEnterRule: "email(['Consignee', 'Agent', 'Shipper', 'Forwarder'])",
            roles: [
                "SwivelAdmin"
            ],
            generatedDate:"gDate = date(booking.estimatedDepartureDate);",
            action: ""
        },
        {
            name: "HBL Ready",
            validationRules: [],
            roles: [
                "SwivelAdmin"
            ],
            action: "",
            generatedDate:"gDate = date(booking.estimatedDepartureDate); gDate= gDate.addDays(2)",
        },
        {
            name: "ASN Ready",
            validationRules: [],
            roles: [
                "SwivelAdmin",
                "ShipperUser"
            ],
            action: "",
            generatedDate:"gDate = date(booking.estimatedDepartureDate); gDate= gDate.addDays(3)",
        },
        {
            name: "ASN Doc Checked",
            validationRules: [],
            generatedDate:"gDate = date(booking.estimatedArrivalDate); gDate= gDate.addDays(2)",
            roles: [
                "SwivelAdmin",
                "ShipperUser"
            ],
            action: ""
        },
        {
            name: "ASN Doc Approved",
            validationRules: [],
            generatedDate:"gDate = date(booking.estimatedArrivalDate); gDate= gDate.addDays(2)",
            roles: [
                "SwivelAdmin",
                "ShipperAdmin",
                "ForwarderAdmin"
            ],
            action: ""
        },
        {
            name: "Completed",
            validationRules: [],
            generatedDate:"gDate = date(booking.estimatedArrivalDate); gDate= gDate.addDays(2)",
            roles: [
                "SwivelAdmin"
            ],
            action: ""
        },
        {
            name: "Cancelled",
            validationRules: "",
            roles: [
                "ForwarderAdmin",
                "ForwarderUser",
                "ConsigneeAdmin",
                "ConsigneeUser",
                "ShipperAdmin",
                "ShipperUser"
            ],
            action: "/cancel-booking"
        }
    ],
    transitions: {
        "Booked": {
            allowableNextStates: [
                "Shipping Advice Ready"
            ]
        },
        "Shipping Advice Ready": {
            allowableNextStates: [
                "Shipping Advice Confirmed",
                "Cancelled"
            ]
        },
        "Shipping Advice Confirmed": {
            allowableNextStates: [
                "Shipping Instructions Ready"
            ]
        },
        "Shipping Instructions Ready": {
            allowableNextStates: [
                "HBL Ready"
            ]
        },
        "HBL Ready": {
            allowableNextStates: [
                "ASN Ready"
            ]
        },
        "ASN Ready": {
            allowableNextStates: [
                "ASN Doc Checked"
            ]
        },
        "ASN Doc Checked": {
            allowableNextStates: [
                "ASN Doc Approved"
            ]
        },
        "ASN Doc Approved": {
            allowableNextStates: [
                "Completed"
            ]
        },
        "Completed":{
            allowableNextStates: []
        },
        "Cancelled": {
            allowableNextStates: []
        }
    }
}