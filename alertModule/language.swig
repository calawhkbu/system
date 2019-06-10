[

    {

        "alertType" : "bookingMessage",

        "templatePath":"message/booking-message",

        "title" : {

            "en" : "title of booking-message message",
            "zh-CN" : "title of booking-message zh-CN message"
        },

        "message" : {
            "en" : "this is a message",
            "zh-CN" : "this is a zh-CN message"
        }

    },

    {

        "alertType" : "shipmentMessage",

        "templatePath":"message/shipment-message",

        "title" : {

            "en" : "title of shipment-message message",
            "zh-CN" : "title of shipment-message zh-CN message"
        },

        "message" : {
            "en" : "this is a message",
            "zh-CN" : "this is a zh-CN message"
        }

    },

    {

        "alertType" : "bookingalerttest",
        "tableName" : "booking",

        "templatePath":"alert/booking-alert",

        "title" : {

            "en" : "title of booking with id : {{id}}",
            "zh-CN" : "title of zh message of ur bookign with id {{id}}"
        },

        "message" : {
            "en" : "this is a message of ur booking with id : {{id}}",
            "zh-CN" : "this is a zh-CN message of ur bookign with id {{id}}"
        }

    },

    {

        "alertType" : "shipmentalerttest",
        "tableName" : "shipment",

        "templatePath":"alert/shipment-alert",

        "title" : {

            "en" : "title of shipment with id : {{id}}",
            "zh" : "title of zh message of ur shipment with id {{id}}"
        },

        "message" : {
            "en" : "this is a message of ur shipment with id : {{id}}",
            "zh" : "this is a zh message of ur shipment with id {{id}}"
        }

    }


]