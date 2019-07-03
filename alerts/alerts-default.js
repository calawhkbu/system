module.exports = {
    hints:{
        schedule:"Seconds(0-59) Minutes(0-59) Hours(0-23) Day of Month(1-31) Months(0-11) Day of Week(0-6)"
    },
    defaultHandlers:[
      {name:"Email",code:"email"},
      {name:"WeChat",code:"weChat"},
      {name:"SMS",code:"sms"},
      {name:"No Notification", code:"noNotifaction"}
    ],
    alerts: [
        {
            displayName: "New Booking",
            type:"New Booking",
            on:false,
            handlers:[{name:"Alerts",code:"bookingEmail"}]
        },
        {
            displayName:"Update Booking",
            type: "update_booking",
            on:false,
            handlers:[{name:"Booking update mail",code:"sendEmail"}]
        },
        {
            displayName:"Update Bill Tracking",
            type: "update_billTracking",
            on:false,
            handlers:[]
        },
        {
            displayName:"Update Status",
            type: "Update Status",
            on:false,
            handlers:[]
        },
        {
            entity: "booking",
            type: "Late Ship",
            displayName:"Late Ship",
            on:false,
            schedule:"1 5 * * * *",
            handlers:[{name: "Alert",
                code:"saveAlert",
                on:true,
                parameters: {
                    tableName:"booking",
                    severity:"Medium",
                    primaryKey:"id",
                    customerId:"customerId",
                    alertCategory:"Exception"
                }
             },{name: "Send notifications",
                code:"sendNotification",
                on:true,
                parameters: {
                    tableName:"booking",
                    severity:"Medium",
                    primaryKey:"id",
                    customerId:"customerId",
                    alertCategory:"Exception",
                    email: {
                        template: "booking-notification",
                        subject: "Late ship for booking # {{bookingNo}}"
                    },
                    wechat: {
                      publicTemplateId: 'OPENTM402244876',
                      privateTemplateId: 'sX4vIVmYVap4hJ9GO8Ze6ReWp1hhqzQq7_QysyA3lSw',
                      dataBinding: []
                    }
                }
            }],
            definition: "booking",
            message: "Late ship for booking id# {{id}}",
            filters:[{"etdBetweenDays":7},{"alertType":"Cargo Not Ready"},{"cargoReadyDate":null}],
            limit:1000,
            roles:["ShipperUser","ShipperAdmin", "ForwarderAdmin"],
            defaultFilters: {},
            onlySubscribers:true
        },
        {
            entity: "bill",
            type: "Prepaid Invoice Missing",
            displayName:"Prepaid Invoice Missing",
            on:false,
            schedule:"1 10 * * * *",
            handlers:[{name: "Send notifications",
                code:"sendNotification",
                on:true,
                parameters: {
                    tableName:"bill",
                    severity:"Medium",
                    primaryKey:"id",
                    customerId:"customerId",
                    alertCategory:"Action",
                    email: {
                        template: "notification",
                        isAlert: true,
                        subject: "Prepaid Invoice Missing for bill id # {{id}}"
                    },
                    wechat: {
                        publicTemplateId: 'OPENTM402244876',
                        privateTemplateId: 'sX4vIVmYVap4hJ9GO8Ze6ReWp1hhqzQq7_QysyA3lSw',
                        dataBinding: []
                    }
                }
            }],
            definition: "alerts-bill",
            message: "Prepaid Invoice Missing for bill id # {{id}}",
            filters:[{"etdDaysFromNow":3},{"alertType":"Prepaid Invoice Missing"},{"transactionStatus":"Create Prepaid Sales Invoice"}],
            limit:1000,
            roles:["ShipperUser","ShipperAdmin", "ForwarderAdmin"],
            defaultFilters: {},
            onlySubscribers:true
        },
        {
            entity: "bill",
            type: "VGM Missing",
            displayName:"VGM Missing",
            on:false,
            schedule:"1 15 * * * *",
            handlers:[{name: "Send notifications",
                code:"sendNotification",
                on:true,
                parameters: {
                    tableName:"bill",
                    severity:"Medium",
                    primaryKey:"id",
                    customerId:"customerId",
                    alertCategory:"Action",
                    email: {
                        isAlert: true,
                        template: "notification",
                        subject: "VGM Missing for bill id # {{id}}"
                    },
                    wechat: {
                        publicTemplateId: 'OPENTM402244876',
                        privateTemplateId: 'sX4vIVmYVap4hJ9GO8Ze6ReWp1hhqzQq7_QysyA3lSw',
                        dataBinding: []
                    }
                }
            }],
            definition: "vgm-missing",
            message: "VGM Missing for bill id # {{id}}",
            filters:[{"etdBetweenDays":3},{"vgmWeightGreater":0},{"alertType":"VGM Missing"}],
            limit:1000,
            roles:["ShipperUser","ShipperAdmin", "ForwarderAdmin"],
            defaultFilters: {},
            onlySubscribers:true
        },
        {
            entity: "bill",
            type: "Missing MBL",
            displayName:"Missing MBL",
            on:false,
            schedule:"1 20 * * * *",
            handlers:[{name: "Alert",
                code:"saveAlert",
                on:true,
                    parameters: {
                        tableName: "bill",
                        severity: "Medium",
                        primaryKey: "id",
                        customerId: "customerId",
                        alertCategory:"Action"
                    }
                }],
            definition: "alerts-bill",
            message: "Missing MBL for bill id # {{id}}",
            filters:[{"etdDaysFromNow":3},{"transactionStatus":"Create Sample Ocean Bill"},{"alertType":"Missing MBL"}],
            limit:1000,
            roles:["ShipperUser","ShipperAdmin", "ForwarderAdmin"],
            defaultFilters: {},
            onlySubscribers:true
        },
        {
            entity: "transactionStatus",
            type: "Booking Delayed",
            displayName:"Booking Delayed",
            on:false,
            schedule:"1 21 * * * *",
            handlers:[{name: "Alert",
                code:"saveAlert",
                on:true,
                    parameters: {
                        tableName:"booking",
                        severity:"Medium",
                        primaryKey:"primaryKey",
                        customerId:"customerId",
                        alertCategory:"Exception"
                    }
                },
                {
                    name: "Send notifications",
                    code: "sendNotification",
                    on:true,
                    parameters: {
                        tableName: "booking",
                        severity: "Medium",
                        primaryKey: "primaryKey",
                        customerId: "customerId",
                        alertCategory: "Exception",
                        email: {
                            isAlert: true,
                            template: "notification",
                            subject: "Booking delayed for id# {{id}}."
                        },
                        wechat: {
                          publicTemplateId: 'TM00076',
                          privateTemplateId: 'H1AHBjpDIjW394N5qdhyxLajBsgURU02xAwNzM9QsLg',
                          dataBinding: []
                        }
                    }
                }],
            definition: "alerts-transactionStatus",
            message: "Booking delayed for id# {{id}}.",
            filters:[{"tableName":["booking"]},{"booking":"booking"},{"trackingStatus":"Delayed"},{"alertType":"Booking delayed"}],
            limit:1000,
            roles:["ShipperUser","ShipperAdmin", "ForwarderAdmin"],
            defaultFilters: {},
            onlySubscribers:false
        }
    ]
}
