[
    {

        "alertCategory": "Message",
        "alertType": "bookingMessage",
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
        "alertType": "bookingalerttest",
        "severity" : "medium",

        "contactRoleList" : [
            "forwarder",
            "shipper",
            "consignee"
        ],

        "extraContactPersonSql" :{

            "where" :{


            }

        },

        "active": false
 
    }

]