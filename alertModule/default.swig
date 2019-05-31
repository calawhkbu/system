[

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

        "active": true
 
    }

]