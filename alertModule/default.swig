[
  {
    "alertCategory": "Message",
    "alertType": "bookingMessage",
    "tableName": "booking",
    "templatePath": "message/booking-message",
    "severity": "medium",

    "contactRoleList": ["forwarder", "shipper", "consignee"],

    "extraContactPersonSql": {
      "where": {
        "userName": "marco.lor@swivelsoftware.com"
      }
    },

    "active": true
  },

  {
    "alertCategory": "Message",
    "alertType": "shipmentMessage",
    "tableName": "shipment",
    "templatePath": "message/shipment-message",
    "severity": "medium",

    "contactRoleList": ["forwarder", "shipper", "consignee"],

    "extraContactPersonSql": {
      "where": {
        "userName": "marco.lor@swivelsoftware.com"
      }
    },

    "active": true
  },

  {
    "alertCategory": "Exception",
    "alertType": "shipmentEtaChanged",
    "templatePath": "alert/shipment-alert",

    "severity": "medium",

    "contactRoleList": ["shipper","forwarder"],

    "extraContactPersonSql": null,

    "active": false
  },

  {
    "alertCategory": "Exception",
    "alertType": "shipmentEtdChanged",
    "templatePath": "alert/shipment-alert",

    "severity": "medium",

    "contactRoleList": ["shipper","forwarder"],

    "extraContactPersonSql": null,

    "active": false
  },

  {
    "schedule": "0 * * ? * *",

    "tableName": "booking",

    "defaultSql": {
      "conditions": {
        "classname": "AndExpressions",
        "expressions": [
          {
            "classname": "IsNullExpression",
            "left": {
              "classname": "ColumnExpression",
              "name": "b.cargoReadyDateEstimated"
            }
          },
          {
            "classname": "BetweenExpression",
            "left": {
              "classname": "ColumnExpression",
              "name": "b.departureDateEstimated"
            },
            "start": {
                "classname" : "FunctionExpression",
                "name" : "NOW"
            },
            "end": {
                "classname" : "FunctionExpression",
                "name" : "DATE_ADD",
                "parameters" : [
                    {
                        "classname" : "FunctionExpression",
                        "name" : "NOW"
                    },
                    {
                        "classname" : "ParameterExpression",
                        "prefix" : "INTERVAL",
                        "expression": 7,
                        "suffix": "DAY"
                    }

                ]
            }
          }
        ]
      }
    },

    "alertCategory": "Exception",
    "alertType": "lateShip",
    "templatePath": "alert/booking-alert",

    "severity": "medium",

    "contactRoleList": ["shipper", "forwarder"],

    "extraContactPersonSql": {
      "where": {
        "userName": "marco.lor@swivelsoftware.com"
      }
    },

    "active": true
  },

  {
    "alertCategory": "Exception",
    "alertType": "prepaidInvoiceMissing",
    "templatePath": "alert/shipment-alert",

    "severity": "medium",

    "contactRoleList": ["shipper","forwarder"],

    "extraContactPersonSql": null,

    "active": false
  },

  {
    "alertCategory": "Exception",
    "alertType": "VgmMissing",
    "templatePath": "alert/shipment-alert",

    "severity": "medium",

    "contactRoleList": ["shipper","forwarder"],

    "extraContactPersonSql": null,

    "active": false
  },

  {
    "alertCategory": "Exception",
    "alertType": "MblMissing",
    "templatePath": "alert/shipment-alert",

    "severity": "medium",

    "contactRoleList": ["shipper","forwarder"],

    "extraContactPersonSql": null,

    "active": false
  },

  {
    "alertCategory": "Exception",
    "alertType": "bookingDelayed",
    "templatePath": "alert/booking-alert",

    "severity": "medium",

    "contactRoleList": ["shipper","forwarder"],

    "extraContactPersonSql": null,

    "active": false
  },

  {
    "alertCategory": "Exception",
    "alertType": "arrivalDelayed(AIR)",
    "tableName": "shipment",
    "templatePath": "message/shipment-alert",
    "severity": "medium",

    "contactRoleList": ["forwarder", "shipper", "consignee"],

    "extraContactPersonSql": null,

    "active": false
  },
  {
    "alertCategory": "Exception",
    "alertType": "arrivalDelayed(SEA)",
    "tableName": "shipment",
    "templatePath": "message/shipment-alert",
    "severity": "medium",

    "contactRoleList": ["forwarder", "shipper", "consignee"],

    "extraContactPersonSql": null,

    "active": false
  },
  {
    "alertCategory": "Exception",
    "alertType": "departureDelayed(AIR)",
    "tableName": "shipment",
    "templatePath": "message/shipment-alert",
    "severity": "medium",

    "contactRoleList": ["forwarder", "shipper", "consignee"],

    "extraContactPersonSql": null,

    "active": false
  },
  {
    "alertCategory": "Exception",
    "alertType": "departureDelayed(SEA)",
    "tableName": "shipment",
    "templatePath": "message/shipment-alert",
    "severity": "medium",

    "contactRoleList": ["forwarder", "shipper", "consignee"],

    "extraContactPersonSql": null,

    "active": false
  }
]
