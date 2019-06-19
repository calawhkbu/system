[
    {

        "alertCategory": "Message",
        "alertType": "bookingMessage",
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

            "where" :{
                "forwarderPartyId" : [{{ partyIdList }}],
                "id" : 1
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