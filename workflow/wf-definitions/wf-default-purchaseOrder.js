//TODO NEED TO UPDATE THE ACTUAL RULES
module.exports ={
    defaultStatus:"New Order",
    statusList: [
        {
            name: "New Order",
            validationRules: [
            ],
            tags: {
            },
            roles: [
              "SwivelAdmin",
              "Admin",
              "User"
            ],
            generatedDate:"gDate = date(purchaseOrder.createdAt); var aDate=date(purchaseOrder.createdAt)",
            actualDate:"aDate = date(purchaseOrder.createdAt);",
            trackingStatus:"New Order"
        },
        {
            name: "Confirm Order",
            validationRules: [
                {
                    script: "result = documentExists(purchaseOrder,['Order Info'])",
                    error: "Please upload Order Info to move forward",
                    action: "/widgets/booking-cards/DocumentsUpload.js",
                    parameters: {
                        allowUpdate:true,
                        fields:[],
                        missingFiles:['Order Info']
                    }
                },
                {
                    script: "result = (purchaseOrder.referenceNumber && purchaseOrder.referenceNumber.length>0)",
                    error: "Reference Number should not be empty.",
                    action: "/widgets/booking-cards/RemoteComponent.js",
                    parameters: {
                        allowUpdate:true,
                        fields:['Ref. No.']
                    }
                }
            ],
            tags: {
            },
            onEnterRule: "isSent =  sendNotifications(purchaseOrder,{entityName:'purchaseOrder',rolesToEmail:['Factory', 'Buyer'],useMeta:false})",
            roles: [
              "SwivelAdmin",
              "Admin",
              "User"
            ],
            action: "",
            generatedDate:"gDate = date(purchaseOrder.createdAt); gDate= gDate.addDays(2)",
        },
        {
            name: "Assign Logistics Provider",
            validationRules: [
                {
                    script: "result = documentExists(purchaseOrder,['Po Invoice'])",
                    error: "Please upload PO Invoice to move forward",
                    action: "/widgets/booking-cards/DocumentsUpload.js",
                    parameters: {
                        allowUpdate:true,
                        fields:[],
                        missingFiles:['Po Invoice']
                    }
                }
            ],
            generatedDate:"gDate = date(purchaseOrder.createdAt); gDate= gDate.addDays(5)",
            tags: {
            },
            onEnterRule: "isSent =  sendNotifications(purchaseOrder,{entityName:'purchaseOrder',rolesToEmail:['Consignee','Shipper'],useMeta:false})",
            roles: [
              "SwivelAdmin",
              "Admin",
              "User"
            ],
            action: ""
        },
        {
            name: "Assign Schedules",
            validationRules: [],
            generatedDate:"gDate = date(purchaseOrder.createdAt); gDate= gDate.addDays(10)",
            tags: {
            },
            onEnterRule: "isSent =  sendNotifications(purchaseOrder,{entityName:'purchaseOrder',rolesToEmail:['Consignee','Shipper'],useMeta:false})",
            roles: [
              "SwivelAdmin",
              "Admin",
              "User"
            ],
            action: ""
        },
        {
            name: "Book Shipment",
            validationRules: [],
            generatedDate:"gDate = date(purchaseOrder.createdAt); gDate= gDate.addDays(15)",
            tags: {
            },
            onEnterRule: "isSent =  sendNotifications(purchaseOrder,{entityName:'purchaseOrder',rolesToEmail:['Factory','Shipper'],useMeta:false})",
            roles: [
              "SwivelAdmin",
              "Admin",
              "User"
            ],
            action: ""
        },
        {
            name: "Approve Shipment",
            validationRules: [],
            generatedDate:"gDate = date(purchaseOrder.createdAt); gDate= gDate.addDays(18)",
            tags: {
            },
            onEnterRule: "isSent =  sendNotifications(purchaseOrder,{entityName:'purchaseOrder',rolesToEmail:['Factory','Shipper'],useMeta:false})",
            roles: [
              "SwivelAdmin",
              "Admin",
              "User"
            ],
            action: ""
        },
        {
            name: "Shipment Ready",
            validationRules: [],
            generatedDate:"gDate = date(purchaseOrder.createdAt); gDate= gDate.addDays(20)",
            tags: {
            },
            roles: [
              "SwivelAdmin",
              "Admin",
              "User"
            ],
            action: ""
        },
        {
            name: "Shipment Departed",
            validationRules: [],
            generatedDate:"gDate = date(purchaseOrder.createdAt); gDate= gDate.addDays(23)",
            tags: {
            },
            roles: [
              "SwivelAdmin",
              "Admin",
              "User"
            ],
            action: ""
        },
        {
            name: "Completed",
            validationRules: [],
            generatedDate:"gDate = date(purchaseOrder.createdAt); gDate= gDate.addDays(25)",
            tags: {
            },
            roles: [
              "SwivelAdmin",
              "Admin",
              "User"
            ],
            action: ""
        },
        {
            name: "Cancelled",
            validationRules: [],
            roles: [
              "SwivelAdmin",
              "Admin",
              "User"
            ],
            action: "/cancel-booking"
        }
    ],
    transitions: {
        "New Order": {
            allowableNextStates: [
                "Confirm Order"
            ],
            requiredActions: [
                "Confirm Order"
            ]
        },
        "Confirm Order": {
            allowableNextStates: [
                "Assign Logistics Provider",
                "Cancelled"
            ],
            requiredActions: [
                "Assign Logistics Provider"
            ]
        },
        "Assign Logistics Provider": {
            allowableNextStates: [
                "Assign Schedules"
            ],
            requiredActions: [
                "Assign Schedules"
            ]
        },
        "Assign Schedules": {
            allowableNextStates: [
                "Book Shipment",
                "Cancelled"
            ],
            requiredActions: [
                "Assign Logistics Provider"
            ]
        },
        "Book Shipment": {
            allowableNextStates: [
                "Approve Shipment"
            ],
            requiredActions: [
                "Book Shipment for PO"
            ]
        },
        "Approve Shipment": {
            allowableNextStates: [
                "Shipment Ready",
                "Cancelled"
            ],
            requiredActions: [
                "Approve Shipment"
            ]
        },
        "Shipment Ready": {
            allowableNextStates: [
                "Shipment Departed"
            ],
            requiredActions: [
                "Mark Departure"
            ]
        },
        "Shipment Departed": {
            allowableNextStates: [
                "Completed"
            ],
            requiredActions: [
                "Confirm Shipment"
            ]
        },
        "Completed": {
            allowableNextStates: []
        },
        "Cancelled": {
            allowableNextStates: []
        }
    }
}
