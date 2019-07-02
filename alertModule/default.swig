[
    {

        "alertCategory": "Message",
        "alertType": "bookingMessage",
        "tableName" : "booking",
        "templatePath":"message/booking-message",
        "severity" : "medium",

        "contactRoleList" : [
            "forwarder",
            "shipper",
            "consignee"
        ],

        "extraContactPersonSql" : {

            "where":{
                "userName" : "marco.lor@swivelsoftware.com"

            }
        },

        "active" : true
        
 
    },

    {

        "alertCategory": "Message",
        "alertType": "shipmentMessage",
        "tableName" : "shipment",
        "templatePath":"message/shipment-message",
        "severity" : "medium",

        "contactRoleList" : [
            "forwarder",
            "shipper",
            "consignee"
        ],

        "extraContactPersonSql" : {

            "where":{
                "userName" : "marco.lor@swivelsoftware.com"

            }
        },

        "active" : true
        
 
    },


    {
        "schedule" : "0 * * ? * *",

        "tableName" : "booking",
        "defaultSql" : {

            "conditions" : {
                "classname": "BinaryExpression",
                "left": {
                    "classname": "ColumnExpression",
                    "name": "b.id"
                },
                "operator": "=",
                "right": 1
            }

        },

        "alertCategory": "Exception",
        "alertType": "bookingAlert",
        "templatePath":"alert/booking-alert",
        "severity" : "medium",

        "contactRoleList" : [

        ],

        "extraContactPersonSql" :{

            "where":{
                "userName" : "marco.lor@swivelsoftware.com"
            }

        },

        "active": true
 
    }

]