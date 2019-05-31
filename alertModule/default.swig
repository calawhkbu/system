[

    {
        "schedule" : "0 * * ? * *",

        "tableName" : "booking",
        "defaultSql" : {


            "where" :{

                "forwarderPartyId" : [{{ partyIdList }}]

            }
        },

        "alertCategory": "Exception",
        "alertType": "bookingalerttest",
        "severity" : "medium",

        "displayName":"Booking Alert Test",

        "templateName":"bookingalerttest",

        "contactRoleList" : [
            "forwarder",
            "shipper",
            "consignee"
        ],

        "extraContactPersonSql" :{

            "where" :{

                "email" : "marco.lor@swivelsoftware.com"

            }

        },

        "active": true
 
    }

]