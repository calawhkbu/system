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
    "alertCategory": "message",
    "alertType": "newBooking",
    "tableName": "booking",
    "templatePath": "message/new-booking-preview",
    "severity": "medium",

    "variableList" : "all",

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
    "alertType": "bookingEtaChanged",
    "tableName": "booking",
    "templatePath": "alert/booking-alert",

    "severity": "medium",

    "contactRoleList": ["shipper", "forwarder"],

    "extraContactPersonSql": null,

    "active": false
  },

  {
    "alertCategory": "Exception",
    "alertType": "bookingEtdChanged",
    "tableName": "booking",
    "templatePath": "alert/booking-alert",

    "severity": "medium",

    "contactRoleList": ["shipper", "forwarder"],

    "extraContactPersonSql": null,

    "active": false
  },

  {
    "alertCategory": "Exception",
    "alertType": "bookingAtaChanged",
    "tableName": "booking",
    "templatePath": "alert/booking-alert",

    "severity": "medium",

    "contactRoleList": ["shipper", "forwarder"],

    "extraContactPersonSql": null,

    "active": false
  },

  {
    "alertCategory": "Exception",
    "alertType": "bookingAtdChanged",
    "tableName": "booking",
    "templatePath": "alert/booking-alert",

    "severity": "medium",

    "contactRoleList": ["shipper", "forwarder"],

    "extraContactPersonSql": null,

    "active": false
  },

  {
    "alertCategory": "Exception",
    "alertType": "shipmentEtaChanged",
    "templatePath": "alert/shipment-alert",

    "severity": "medium",

    "contactRoleList": ["shipper", "forwarder"],

    "extraContactPersonSql": null,

    "active": false
  },

  {
    "alertCategory": "Exception",
    "alertType": "shipmentEtdChanged",
    "templatePath": "alert/shipment-alert",

    "severity": "medium",

    "contactRoleList": ["shipper", "forwarder"],

    "extraContactPersonSql": null,

    "active": false
  },


  {
    "alertCategory": "Exception",
    "alertType": "shipmentAtaChanged",
    "tableName" : "shipment",
    "templatePath": "alert/shipment-alert",

    "severity": "medium",
    "contactRoleList": ["shipper", "forwarder"],

    "extraContactPersonSql": null,

    "active": false
  },

  {
    "alertCategory": "Exception",
    "alertType": "shipmentAtdChanged",
    "tableName" : "shipment",

    "templatePath": "alert/shipment-alert",
    "severity": "medium",
    "contactRoleList": ["shipper", "forwarder"],

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
              "classname": "FunctionExpression",
              "name": "NOW"
            },
            "end": {
              "classname": "FunctionExpression",
              "name": "DATE_ADD",
              "parameters": [
                {
                  "classname": "FunctionExpression",
                  "name": "NOW"
                },
                {
                  "classname": "ParameterExpression",
                  "prefix": "INTERVAL",
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

    "variableList": ["shipperPartyCode"],

    "templatePath": "alert/booking-alert",

    "severity": "medium",

    "contactRoleList": ["shipper", "forwarder"],

    "extraContactPersonSql": {
      "where": {
        "userName": "marco.lor@swivelsoftware.com"
      }
    },

    "active": false
  },

  {
    "alertCategory": "Exception",
    "alertType": "prepaidInvoiceMissing",
    "templatePath": "alert/shipment-alert",

    "severity": "medium",

    "contactRoleList": ["shipper", "forwarder"],

    "extraContactPersonSql": null,

    "active": false
  },

  {
    "alertCategory": "Exception",
    "alertType": "VgmMissing",
    "templatePath": "alert/shipment-alert",

    "severity": "medium",

    "contactRoleList": ["shipper", "forwarder"],

    "extraContactPersonSql": null,

    "active": false
  },

  {
    "alertCategory": "Exception",
    "alertType": "MblMissing",
    "templatePath": "alert/shipment-alert",

    "severity": "medium",

    "contactRoleList": ["shipper", "forwarder"],

    "extraContactPersonSql": null,

    "active": false
  },

  {
    "alertCategory": "Exception",
    "alertType": "bookingDelayed",
    "templatePath": "alert/booking-alert",

    "severity": "medium",

    "contactRoleList": ["shipper", "forwarder"],

    "extraContactPersonSql": null,

    "active": false
  },



  {
    "alertCategory": "Exception",
    "alertType": "bookingArrivalDelayed(AIR)",
    "tableName": "booking",
    "templatePath": "message/booking-alert",
    "severity": "medium",

    "contactRoleList": ["forwarder", "shipper", "consignee"],

    "extraContactPersonSql": null,

    "active": false
  },
  {
    "alertCategory": "Exception",
    "alertType": "bookingArrivalDelayed(SEA)",
    "tableName": "booking",
    "templatePath": "message/booking-alert",
    "severity": "medium",

    "contactRoleList": ["forwarder", "shipper", "consignee"],

    "extraContactPersonSql": null,

    "active": false
  },
  {
    "alertCategory": "Exception",
    "alertType": "bookingDepartureDelayed(AIR)",
    "tableName": "booking",
    "templatePath": "message/booking-alert",
    "severity": "medium",

    "contactRoleList": ["forwarder", "shipper", "consignee"],

    "extraContactPersonSql": null,

    "active": false
  },
  {
    "alertCategory": "Exception",
    "alertType": "bookingDepartureDelayed(SEA)",
    "tableName": "booking",
    "templatePath": "message/booking-alert",
    "severity": "medium",

    "contactRoleList": ["forwarder", "shipper", "consignee"],

    "extraContactPersonSql": null,

    "active": false
  },

  {
    "alertCategory": "Exception",
    "alertType": "shipmentArrivalDelayed(AIR)",
    "tableName": "shipment",
    "templatePath": "message/shipment-alert",
    "severity": "medium",

    "contactRoleList": ["forwarder", "shipper", "consignee"],

    "extraContactPersonSql": null,

    "active": false
  },
  {
    "alertCategory": "Exception",
    "alertType": "shipmentArrivalDelayed(SEA)",
    "tableName": "shipment",
    "templatePath": "message/shipment-alert",
    "severity": "medium",

    "contactRoleList": ["forwarder", "shipper", "consignee"],

    "extraContactPersonSql": null,

    "active": false
  },
  {
    "alertCategory": "Exception",
    "alertType": "shipmentDepartureDelayed(AIR)",
    "tableName": "shipment",
    "templatePath": "message/shipment-alert",
    "severity": "medium",

    "contactRoleList": ["forwarder", "shipper", "consignee"],

    "extraContactPersonSql": null,

    "active": false
  },
  {
    "alertCategory": "Exception",
    "alertType": "shipmentDepartureDelayed(SEA)",
    "tableName": "shipment",
    "templatePath": "message/shipment-alert",
    "severity": "medium",

    "contactRoleList": ["forwarder", "shipper", "consignee"],

    "extraContactPersonSql": null,

    "active": false
  }
]
