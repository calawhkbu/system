import { AlertConfig, AlertFlexDataConfig } from 'modules/sequelize/interfaces/alert'
import { AlertPreferenceDetail } from 'modules/sequelize/interfaces/alertPreference'
import { IQueryParams } from 'classes/query'

const schedulerActive = false


// if testMode = true, will only send alert to those testAlertEmailList
// make sure those email already have an acc
const testMode = false
const testAlertEmailList = [
  'marco.lor+0843@swivelsoftware.com'
]


const ASWAlertConfigList = [
  // lateArrival(SEA)
  {
    tableName: 'shipment',
    alertCategory: 'Exception',
    severity: 'high',
    alertType: 'lateArrival(SEA)',

    templatePath: 'alert/shipment-alert',

    handleAlertSubComponentLayoutName: 'alertForm.lateArrival',

    interval: {
      value: 15,
      unit: 'MINUTE'
    },

    active: true,

    queryName: 'shipment',
    query: {
      subqueries: {

        moduleTypeCode: {
          value: "SEA"
        },

        // missing arrivalDateActual
        arrivalDateActualIsNull: true,

        // after arrivalDateEstimated + 1 day
        after_arrivalDateEstimatedInUtc: {
          value: {
            value: 1,
            unit: 'DAY'
          }
        },


      },

    } as IQueryParams,

    closeQuery: {
      subqueries: {
        arrivalDateActualIsNotNull: true,
      }
    } as IQueryParams,

    contactRoleList: ['forwarder','personInCharge','office','shipper', 'consignee'],
    canCloseBy: [
      {
        type: 'all'
      }
    ],
  } as AlertConfig,



  // lateArrival(AIR)
  {
    tableName: 'shipment',
    alertCategory: 'Exception',
    severity: 'high',
    alertType: 'lateArrival(AIR)',

    templatePath: 'alert/shipment-alert',

    handleAlertSubComponentLayoutName: 'alertForm.lateArrival',

    interval: {
      value: 15,
      unit: 'MINUTE'
    },

    active: true,

    queryName: 'shipment',
    query: {
      subqueries: {

        moduleTypeCode: {
          value: "AIR"
        },

        // missing arrivalDateActual
        arrivalDateActualIsNull: true,

        // after arrivalDateActual + 1 day
        after_arrivalDateEstimatedInUtc: {
          value: {
            value: 1,
            unit: 'HOUR'
          }
        },


      },

    } as IQueryParams,

    closeQuery: {
      subqueries: {
        arrivalDateActualIsNotNull: true,
      }
    } as IQueryParams,

    contactRoleList: ['forwarder','personInCharge','office','shipper', 'consignee'],
    canCloseBy: [
      {
        type: 'all'
      }
    ],
  } as AlertConfig,


  // missingAMS(AIR)
  {
    tableName: 'shipment',
    alertCategory: 'Exception',
    severity: 'medium',
    alertType: 'missingAMS(AIR)',

    templatePath: 'alert/shipment-alert',

    handleAlertSubComponentLayoutName: 'alertForm.missingAMS',

    interval: {
      value: 15,
      unit: 'MINUTE'
    },

    active: true,

    queryName: 'shipment',
    query: {
      subqueries: {

        moduleTypeCode: {
          value: "AIR"
        },

        // missing sendAMSDateActual
        sendAMSDateActualIsNull: true,

        // after_arrivalDateEstimatedInUtc + 1 day
        after_arrivalDateEstimatedInUtc: {
          value: {
            value: 1,
            unit: 'HOUR'
          }
        },


      },

    } as IQueryParams,

    closeQuery: {
      subqueries: {
        sendAMSDateActualIsNotNull: true,
      }
    } as IQueryParams,

    contactRoleList: ['forwarder','personInCharge','office','shipper'],
    canCloseBy: [
      {
        type: 'all'
      }
    ],
  } as AlertConfig,


  // missingAMS(SEA)
  {
    tableName: 'shipment',
    alertCategory: 'Exception',
    severity: 'medium',
    alertType: 'missingAMS(SEA)',

    templatePath: 'alert/shipment-alert',

    handleAlertSubComponentLayoutName: 'alertForm.missingAMS',

    interval: {
      value: 15,
      unit: 'MINUTE'
    },

    active: true,

    queryName: 'shipment',
    query: {
      subqueries: {

        moduleTypeCode: {
          value: "SEA"
        },

        // missing sendAMSDateActual
        sendAMSDateActualIsNull: true,

        // after_arrivalDateEstimatedInUtc + 1 day
        after_arrivalDateEstimatedInUtc: {
          value: {
            value: 1,
            unit: 'DAY'
          }
        },


      },

    } as IQueryParams,

    closeQuery: {
      subqueries: {
        sendAMSDateActualIsNotNull: true,
      }
    } as IQueryParams,

    contactRoleList: ['forwarder','personInCharge','office','shipper'],
    canCloseBy: [
      {
        type: 'all'
      }
    ],
  } as AlertConfig,



  {
    tableName: 'shipment',
    alertCategory: 'Exception',
    severity: 'medium',
    alertType: 'containerReturn',

    templatePath: 'alert/shipment-alert',

    handleAlertSubComponentLayoutName: 'alertForm.containerReturn',
    
    // schedule: '0 * * * * *',

    interval: {
      value: 15,
      unit: 'MINUTE'
    },

    active: true,

    queryName: 'shipment',
    query: {

      subqueries: {

        moduleTypeCode: {
          value: "SEA"
        },

        // missing returnEmptyContainerDateActual
        returnEmptyContainerDateActualIsNull: true,

        // after arrivalDateEstimated + 1 day
        after_arrivalDateEstimatedInUtc: {
          value: {
            value: 1,
            unit: 'DAY'
          }
        },

      },
      
    },

    closeQuery: {
      subqueries : {
        // have returnEmptyContainerDateActual
        returnEmptyContainerDateActualIsNotNull: true 
      }
    },

    contactRoleList: ['forwarder','personInCharge','office','shipper'],
    canCloseBy: [
      {
        type: 'all'
      }
    ]

  },



] as AlertConfig[]


const shipmentSeaAlertList = [

  // cancelBookingAlert(SEA)
  {

    tableName: 'shipment',
    alertCategory: 'Exception',
    severity: 'medium',
    alertType: 'cancelBookingAlert(SEA)',

    templatePath: 'alert/shipment-alert',

    handleAlertSubComponentLayoutName: 'alertForm.cancelBookingAlert',
    

    // schedule: '0 * * * * *',

    interval: {
      value: 15,
      unit: 'MINUTE'
    },
    active: true,

    queryName: 'shipment',
    query: {

      subqueries: {

        moduleTypeCode: {
          value: 'SEA'
        },

        // missing cargoReceiptDateActual
        cargoReceiptDateActualIsNull: true,

        // after after_cargoReadyDateActual / cargoReadyDateEstimated + 2 day
        after_cargoReadyDateActualInUtc_Or_cargoReadyDateEstimatedInUtc: {
          value: {
            value: 2,
            unit: 'DAY'
          }
        }
      },
      
    },

    closeQuery: {
      subqueries : {
        cargoReceiptDateActualIsNotNull: true 
      }
    },

    contactRoleList: ['forwarder','personInCharge','office'],
    canCloseBy: [
      {
        type: 'all'
      }
    ]


  } as AlertConfig,

  // cargoDelayAlert(SEA)
  {

    tableName: 'shipment',
    alertCategory: 'Exception',
    severity: 'medium',
    alertType: 'cargoDelayAlert(SEA)',

    templatePath: 'alert/shipment-alert',

    handleAlertSubComponentLayoutName: 'alertForm.cargoDelayAlert',
    


    // schedule: '0 * * * * *',

    interval: {
      value: 15,
      unit: 'MINUTE'
    },

    active: true,

    queryName: 'shipment',
    query: {

      subqueries: {

        moduleTypeCode: {
          value: 'SEA'
        },

        // missing gateInDateActual
        gateInDateActualIsNull: true,

        // after cYCutOffDateActual / cYCutOffDateEstimated + 2 day
        after_cYCutOffDateActualInUtc_Or_cYCutOffDateEstimatedInUtc: {
          value: {
            value: 1,
            unit: 'DAY'
          }
        },

      },
      
    },

    closeQuery: {
      subqueries : {
        // have gateInDateActual
        gateInDateActualIsNotNull: true 
      }
    },

    contactRoleList: ['forwarder','personInCharge','office'],
    canCloseBy: [
      {
        type: 'all'
      }
    ]
  },

  // cargoFailureToArrangeHualage(SEA)
  {

    tableName: 'shipment',
    alertCategory: 'Exception',
    severity: 'medium',
    alertType: 'cargoFailureToArrangeHualage(SEA)',

    templatePath: 'alert/shipment-alert',

    handleAlertSubComponentLayoutName: 'alertForm.cargoFailureToArrangeHualage',

    
    

    // schedule: '0 * * * * *',

    interval: {
      value: 15,
      unit: 'MINUTE'
    },

    active: true,

    queryName: 'shipment',
    query: {

      subqueries: {

        moduleTypeCode: {
          value: 'SEA'
        },

        // missing sentToShipperDateActual
        sentToShipperDateActualIsNull: true,

        // after cYCutOffDateActual / cYCutOffDateEstimated - 2 day
        after_cYCutOffDateActualInUtc_Or_cYCutOffDateEstimatedInUtc: {
          value: {
            mode: 'before',
            value: 2,
            unit: 'DAY'
          }
        },

      },
      
    },

    closeQuery: {
      subqueries : {
        // have sentToShipperDateActual
        sentToShipperDateActualIsNotNull: true 
      }
    },

    contactRoleList: ['forwarder','personInCharge','office'],
    canCloseBy: [
      {
        type: 'all'
      }
    ]
  },

  // missingVGM(SEA)
  {

    tableName: 'shipment',
    alertCategory: 'Exception',
    severity: 'medium',
    alertType: 'missingVGM(SEA)',

    templatePath: 'alert/shipment-alert',

    handleAlertSubComponentLayoutName: 'alertForm.missingVGM',
    

    // schedule: '0 * * * * *',

    interval: {
      value: 15,
      unit: 'MINUTE'
    },

    active: true,

    queryName: 'shipment',
    query: {

      subqueries: {

        moduleTypeCode: {
          value: 'SEA'
        },

        // missing VGM in any one of the shipment container
        // warning : current now just check shipment that with at least one container
        vgmNonZeroQueryIdNotIn: true,

        // after cYCutOffDateActual / cYCutOffDateEstimated - 1 day
        after_cYCutOffDateActualInUtc_Or_cYCutOffDateEstimatedInUtc: {
          value: {
            mode: 'before',
            value: 1,
            unit: 'DAY'
          }
        },

      },
      
    },

    closeQuery: {
      subqueries : {
        // have vgm non-zero
        vgmNonZeroQueryIdIn: true 
      }
    },


    contactRoleList: ['forwarder','personInCharge','office'],
    canCloseBy: [
      {
        type: 'all'
      }
    ]
  },

  // missingEdi(SEA)
  {

    tableName: 'shipment',
    alertCategory: 'Exception',
    severity: 'medium',
    alertType: 'missingEdi(SEA)',

    templatePath: 'alert/shipment-alert',

    handleAlertSubComponentLayoutName: 'alertForm.missingEdi',
    

    // schedule: '0 * * * * *',

    interval: {
      value: 15,
      unit: 'MINUTE'
    },

    active: true,

    queryName: 'shipment',
    query: {

      subqueries: {

        moduleTypeCode: {
          value: 'SEA'
        },

        // missing preAlertSendDateActual
        ediSendDateActualIsNull: true,


        // after ATD / ETD -1 day
        after_departureDateActualInUtc_Or_departureDateEstimatedInUtc: {
          value: {
            value: -1,
            unit: 'DAY'
          }
        },

        // until ATA
        before_arrivalDateActualInUtc: {
          value: {
            value: 0,
            includeNull: true
          }
        }

      },
      
    },

    closeQuery: {
      subqueries : {
        // have ediSendDateActual
        ediSendDateActualIsNotNull: true 
      }
    },

    contactRoleList: ['forwarder','personInCharge','office'],
    canCloseBy: [
      {
        type: 'all'
      }
    ]
  },

  // missingPreAlert(SEA)
  {

    tableName: 'shipment',
    alertCategory: 'Exception',
    severity: 'medium',
    alertType: 'missingPreAlert(SEA)',

    templatePath: 'alert/shipment-alert',

    handleAlertSubComponentLayoutName: 'alertForm.missingPreAlert',
    

    // schedule: '0 * * * * *',

    interval: {
      value: 15,
      unit: 'MINUTE'
    },

    active: true,

    queryName: 'shipment',
    query: {

      subqueries: {

        moduleTypeCode: {
          value: 'SEA'
        },

        // missing preAlertSendDateActual
        preAlertSendDateActualIsNull: true,

        // after ATD / ETD + 2 day
        after_departureDateActualInUtc_Or_departureDateEstimatedInUtc: {
          value: {
            value: 2,
            unit: 'DAY'
          }
        },

        // before ATA
        before_arrivalDateActualInUtc: {
          value: {
            value: 0,
            includeNull: true
          }
        }
      },
      
    },

    closeQuery: {
      subqueries : {
        // have preAlertSendDateActual
        preAlertSendDateActualIsNotNull: true 
      }
    },


    contactRoleList: ['forwarder','personInCharge','office'],
    canCloseBy: [
      {
        type: 'all'
      }
    ]
  },

  // missingMBL(SEA)
  {
    tableName: 'shipment',
    alertCategory: 'Exception',
    severity: 'medium',
    alertType: 'missingMBL(SEA)',

    templatePath: 'alert/shipment-alert',

    handleAlertSubComponentLayoutName: 'alertForm.missingMBL',
    

    // schedule: '0 * * * * *',

    interval: {
      value: 15,
      unit: 'MINUTE'
    },

    active: true,

    queryName: 'shipment',
    query: {

      subqueries: {

        moduleTypeCode: {
          value: 'SEA'
        },


        // missing masterBillReleasedDateActual
        masterBillReleasedDateActualIsNull: true,

        // after ATD / ETD + 1 day
        after_departureDateActualInUtc_Or_departureDateEstimatedInUtc: {
          value: {
            value: 1,
            unit: 'DAY'
          }
        },

        // until ATA
        before_arrivalDateActualInUtc: {
          value: {
            value: 0,
            includeNull: true
          }
        }

      },
      
    },

    closeQuery: {
      subqueries : {
        // have masterBillReleasedDateActual
        masterBillReleasedDateActualIsNotNull: true 
      }
    },

    contactRoleList: ['forwarder','personInCharge','office'],
    canCloseBy: [
      {
        type: 'all'
      }
    ]

  },

  // missingHBL(SEA)
  {
    tableName: 'shipment',
    alertCategory: 'Exception',
    severity: 'medium',
    alertType: 'missingHBL(SEA)',

    templatePath: 'alert/shipment-alert',

    handleAlertSubComponentLayoutName: 'alertForm.missingHBL',
    

    // schedule: '0 * * * * *',

    interval: {
      value: 15,
      unit: 'MINUTE'
    },

    active: true,

    queryName: 'shipment',
    query: {

      subqueries: {

        moduleTypeCode: {
          value: 'SEA'
        },

        // missing houseBillConfirmationDateActual
        houseBillConfirmationDateActualIsNull: true,

        // after ATD / ETD + 2 day
        after_departureDateActualInUtc_Or_departureDateEstimatedInUtc: {
          value: {
            value: 2,
            unit: 'DAY'
          }
        },

        // until ATA
        before_arrivalDateActualInUtc: {
          value: {
            value: 0,
            includeNull: true
          }
        }

      },
      
    },

    closeQuery: {
      subqueries : {
        // have houseBillConfirmationDateActual
        houseBillConfirmationDateActualIsNotNull: true 
      }
    },


    contactRoleList: ['forwarder','personInCharge','office'],
    canCloseBy: [
      {
        type: 'all'
      }
    ]

  },

  // demurrageWarning(SEA)
  {
    tableName: 'shipment',
    alertCategory: 'Exception',
    severity: 'medium',
    alertType: 'demurrageWarning(SEA)',

    templatePath: 'alert/shipment-alert',

    handleAlertSubComponentLayoutName: 'alertForm.demurrageAlert',

    

    // schedule: '0 * * * * *',

    interval: {
      value: 15,
      unit: 'MINUTE'
    },

    active: true,


    queryName: 'shipment',
    query: {

      subqueries: {

        moduleTypeCode: {
          value: 'SEA'
        },


        // missing arrivalAtDepotActual
        arrivalAtDepotActualIsNull: true,

        // after ATA / ETA + 2 DAY
        after_arrivalDateActualInUtc_Or_arrivalDateEstimatedInUtc: {
          value: {
            value: 2,
            unit: 'DAY'
          }
        },

        // until before_finalDoorDeliveryActual
        before_finalDoorDeliveryActualInUtc: {
          value: {
            value: 0,
            includeNull: true
          }
        }

      },
      
    },

    closeQuery: {
      subqueries : {
        // have arrivalAtDepotActual
        arrivalAtDepotActualIsNotNull: true 
      }
    },


    contactRoleList: ['forwarder','personInCharge','office'],
    canCloseBy: [
      {
        type: 'all'
      }
    ]

  },

  // demurrageAlert(SEA)
  {
    tableName: 'shipment',
    alertCategory: 'Exception',
    severity: 'medium',
    alertType: 'demurrageAlert(SEA)',

    templatePath: 'alert/shipment-alert',

    handleAlertSubComponentLayoutName: 'alertForm.demurrageAlert',
    

    // schedule: '0 * * * * *',

    interval: {
      value: 15,
      unit: 'MINUTE'
    },

    active: true,

    queryName: 'shipment',
    query: {

      subqueries: {

        moduleTypeCode: {
          value: 'SEA'
        },

        // missing pickupCargoBeforeDemurrageDateActual / cargoPickupWithDemurrageDateActual
        pickupCargoBeforeDemurrageDateActual_Or_cargoPickupWithDemurrageDateActualIsNull: true,

        // after ATA / ETA + 5 days
        after_arrivalDateActualInUtc_Or_arrivalDateEstimatedInUtc: {
          value: {
            value: 5,
            unit: 'DAY'
          }
        },

        // before finalDoorDeliveryActual
        before_finalDoorDeliveryActualInUtc: {
          value: {
            value: 0,
            includeNull: true
          }
        }

      },
      
    },

    closeQuery: {
      subqueries : {
        // have pickupCargoBeforeDemurrageDateActual_Or_cargoPickupWithDemurrageDateActual
        pickupCargoBeforeDemurrageDateActual_Or_cargoPickupWithDemurrageDateActualIsNotNull: true 
      }
    },


    contactRoleList: ['forwarder','personInCharge','office'],
    canCloseBy: [
      {
        type: 'all'
      }
    ]

  },

  // detentionWarning(SEA)
  {
    tableName: 'shipment',
    alertCategory: 'Exception',
    severity: 'medium',
    alertType: 'detentionWarning(SEA)',

    templatePath: 'alert/shipment-alert',

    handleAlertSubComponentLayoutName: 'alertForm.detentionAlert',
    
    // schedule: '0 * * * * *',

    interval: {
      value: 15,
      unit: 'MINUTE'
    },

    active: true,

    queryName: 'shipment',
    query: {

      subqueries: {

        moduleTypeCode: {
          value: 'SEA'
        },

        // missing returnEmptyContainerDateActual
        returnEmptyContainerDateActualIsNull: true,

        // after sendToConsigneeDateActual / sendToConsigneeDateEstimated + 3 days
        after_sendToConsigneeDateActualInUtc_Or_sendToConsigneeDateEstimatedInUtc: {
          value: {
            value: 3,
            unit: 'DAY'
          }
        }
      },
      
    },


    closeQuery: {
      subqueries : {
        // have returnEmptyContainerDateActual
        returnEmptyContainerDateActualIsNotNull: true 
      }
    },

    contactRoleList: ['forwarder','personInCharge','office'],
    canCloseBy: [
      {
        type: 'all'
      }
    ]

  },

  // detentionAlert(SEA)
  {
    tableName: 'shipment',
    alertCategory: 'Exception',
    severity: 'medium',
    alertType: 'detentionAlert(SEA)',

    templatePath: 'alert/shipment-alert',

    handleAlertSubComponentLayoutName: 'alertForm.detentionAlert',
    

    // schedule: '0 * * * * *',

    interval: {
      value: 15,
      unit: 'MINUTE'
    },

    active: true,

    queryName: 'shipment',
    query: {

      subqueries: {

        moduleTypeCode: {
          value: 'SEA'
        },

        // missing returnEmptyContainerDateActual
        returnEmptyContainerDateActualIsNull: true,

        // after sendToConsigneeDateActual / sendToConsigneeDateEstimated + 6 days
        after_sendToConsigneeDateActualInUtc_Or_sendToConsigneeDateEstimatedInUtc: {
          value: {
            value: 6,
            unit: 'DAY'
          }
        }
      },
      
    },

    closeQuery: {
      subqueries : {
        // have returnEmptyContainerDateActual
        returnEmptyContainerDateActualIsNotNull: true 
      }
    },

    contactRoleList: ['forwarder','personInCharge','office'],
    canCloseBy: [
      {
        type: 'all'
      }
    ]

  },

  // missingDeliveryArrangement(SEA)
  {
    tableName: 'shipment',
    alertCategory: 'Exception',
    severity: 'medium',
    alertType: 'missingDeliveryArrangement(SEA)',

    templatePath: 'alert/shipment-alert',

    handleAlertSubComponentLayoutName: 'alertForm.missingDeliveryArrangement(SEA)',
    

    // schedule: '0 * * * * *',

    interval: {
      value: 15,
      unit: 'MINUTE'
    },

    active: true,

    queryName: 'shipment',
    query: {

      subqueries: {

        moduleTypeCode: {
          value: 'SEA'
        },

        // missing finalDoorDeliveryDateActual
        finalDoorDeliveryDateActualIsNull: true,

        // ATA / ETA + 14 DAY
        after_arrivalDateActualInUtc_Or_arrivalDateEstimatedInUtc: {
          value: {
            value: 14,
            unit: 'DAY'
          }
        },

        // until finalDoorDeliveryActual
        before_finalDoorDeliveryActualInUtc: {
          value: {
            value: 0,
            includeNull: true
          }
        }

      },
      
    },

    closeQuery: {
      subqueries : {
        // have finalDoorDeliveryDateActual
        finalDoorDeliveryDateActualIsNotNull: true 
      }
    },


    contactRoleList: ['forwarder','personInCharge','office'],
    canCloseBy: [
      {
        type: 'all'
      }
    ]

  }

] as AlertConfig[]

const shipmentAirAlertList = [

  // missingPreAlert(AIR)
  {

    tableName: 'shipment',
    alertCategory: 'Exception',
    severity: 'medium',
    alertType: 'missingPreAlert(AIR)',

    templatePath: 'alert/shipment-alert',

    handleAlertSubComponentLayoutName: 'alertForm.cargoDelayAlert',
    

    // schedule: '0 * * * * *',

    interval: {
      value: 15,
      unit: 'MINUTE'
    },
    active: true,

    queryName: 'shipment',
    query: {

      subqueries: {

        moduleTypeCode: {
          value: 'AIR'
        },

        // missing preAlertSendDateActual
        preAlertSendDateActualIsNull: true,

        // after masterBillReleasedDateActual / masterBillReleasedDateEstimated + 3 hour
        after_masterBillReleasedDateActualInUtc_Or_masterBillReleasedDateEstimatedInUtc: {
          value: {
            value: 3,
            unit: 'HOUR'
          }
        },

      },
      
    },


    closeQuery: {
      subqueries : {
        // have preAlertSendDateActual
        preAlertSendDateActualIsNotNull: true 
      }
    },
    contactRoleList: ['forwarder','personInCharge','office'],
    canCloseBy: [
      {
        type: 'all'
      }
    ]
  },

  // cargoDelayAlert(AIR)
  {

    tableName: 'shipment',
    alertCategory: 'Exception',
    severity: 'medium',
    alertType: 'cargoDelayAlert(AIR)',

    templatePath: 'alert/shipment-alert',

    handleAlertSubComponentLayoutName: 'alertForm.cargoDelayAlert',
    

    // schedule: '0 * * * * *',

    interval: {
      value: 15,
      unit: 'MINUTE'
    },

    active: true,

    queryName: 'shipment',
    query: {

      subqueries: {

        moduleTypeCode: {
          value: 'AIR'
        },

        // missing preAlertSendDateActual
        preAlertSendDateActualIsNull: true,

        // after cargoReceiptDateActual / cargoReceiptDateEstimated - 1 day
        after_cargoReceiptDateActualInUtc_Or_cargoReceiptDateEstimatedInUtc: {
          value: {
            value: -1,
            unit: 'DAY'
          }
        },

      },
      
    },

    closeQuery: {
      subqueries : {
        // have preAlertSendDateActual
        preAlertSendDateActualIsNotNull: true 
      }
    },

    contactRoleList: ['forwarder','personInCharge','office'],
    canCloseBy: [
      {
        type: 'all'
      }
    ]
  } as AlertConfig,

  // missingDeliveryArrangement(AIR)
  {

    tableName: 'shipment',
    alertCategory: 'Exception',
    severity: 'medium',
    alertType: 'missingDeliveryArrangement(AIR)',

    templatePath: 'alert/shipment-alert',
  
    handleAlertSubComponentLayoutName: 'alertForm.missingDeliveryArrangement(AIR)',
  
    // schedule: '0 * * * * *',

    interval: {
      value: 15,
      unit: 'MINUTE'
    },

    active: true,

    queryName: 'shipment',
    query: {

      subqueries: {

        moduleTypeCode: {
          value: 'AIR'
        },

        // missing portOfLoadingCode
        portOfLoadingCodeIsNull: true,

        // after arrivalDateActual / arrivalDateEstimated + 1 day
        after_arrivalDateActualInUtc_Or_arrivalDateEstimatedInUtc: {
          value: {
            value: 1,
            unit: 'DAY'
          }
        },

        // until 30 days after ATA
        before_arrivalDateActualInUtc: {
          value: {
            value: 30,
            unit: 'DAY',
            includeNull: true
          }

        }

      },
      
    },

    closeQuery: {
      subqueries : {
        // have portOfLoadingCode
        portOfLoadingCodeIsNotNull: true 
      }
    },

    contactRoleList: ['forwarder','personInCharge','office'],
    canCloseBy: [
      {
        type: 'all'
      }
    ]
  } as AlertConfig,

]


// alert related to sopTask
const sopTaskAlertList = [

  // hasDueTasksAlert
  {

    tableName: 'shipment',
    alertCategory: 'Exception',
    severity: 'medium',
    alertType: 'hasDueTasksAlert',

    templatePath: 'alert/shipment-alert',

    interval: {
      value: 15,
      unit: 'MINUTE'
    },
    active: true,

    queryName: 'shipment',
    query: {

      subqueries: {
        // missing preAlertSendDateActual
        hasDueTasks: true,

      },
      
    },

    closeQuery: {
      subqueries : {
        // have preAlertSendDateActual
        noDueTasks: true 
      }
    },
    contactRoleList: ['forwarder','personInCharge','office'],
    canCloseBy: [
      {
        type: 'all'
      }
    ]
  },

  // hasDeadTasksAlert
  {

    tableName: 'shipment',
    alertCategory: 'Exception',
    severity: 'medium',
    alertType: 'hasDeadTasksAlert',

    templatePath: 'alert/shipment-alert',

    interval: {
      value: 15,
      unit: 'MINUTE'
    },
    active: true,

    queryName: 'shipment',
    query: {

      subqueries: {
        hasDeadTasks: true,
      },
      
    },


    closeQuery: {
      subqueries : {
        // have preAlertSendDateActual
        noDeadTasks: false 
      }
    },
    contactRoleList: ['forwarder','personInCharge','office'],
    canCloseBy: [
      {
        type: 'all'
      }
    ]
  },

]

const oldAlertList = [

  // shipmentArrivalDelayed(AIR)
  {

    tableName: 'shipment',
    alertCategory: 'Exception',
    severity: 'medium',
    alertType: 'shipmentArrivalDelayed(AIR)',

    templatePath: 'alert/shipment-alert',
    
  },

  // shipmentArrivalDelayed(SEA)
  {

    tableName: 'shipment',
    alertCategory: 'Exception',
    severity: 'medium',
    alertType: 'shipmentArrivalDelayed(SEA)',

    templatePath: 'alert/shipment-alert',
    
  },

  // shipmentDepartureDelayed(AIR)
  {

    tableName: 'shipment',
    alertCategory: 'Exception',
    severity: 'medium',
    alertType: 'shipmentDepartureDelayed(AIR)',

    templatePath: 'alert/shipment-alert',
    
  },

  // shipmentDepartureDelayed(SEA)
  {

    tableName: 'shipment',
    alertCategory: 'Exception',
    severity: 'medium',
    alertType: 'shipmentDepartureDelayed(SEA)',

    templatePath: 'alert/shipment-alert',
    
  },

  // shipmentEtaChanged
  {

    tableName: 'shipment',
    alertCategory: 'Exception',
    severity: 'medium',
    alertType: 'shipmentEtaChanged',

    templatePath: 'alert/shipment-alert',
    
  },

  // shipmentEtdChanged
  {

    tableName: 'shipment',
    alertCategory: 'Exception',
    severity: 'medium',
    alertType: 'shipmentEtdChanged',

    templatePath: 'alert/shipment-alert',
    
  },


  // shipmentAtaChanged
  {

    tableName: 'shipment',
    alertCategory: 'Exception',
    severity: 'medium',
    alertType: 'shipmentAtaChanged',

    templatePath: 'alert/shipment-alert',
    
  },

  // shipmentAtdChanged
  {

    tableName: 'shipment',
    alertCategory: 'Exception',
    severity: 'medium',
    alertType: 'shipmentAtdChanged',

    templatePath: 'alert/shipment-alert',
    
  },

  // shipmentMessage
  {

    tableName: 'shipment',
    alertCategory: 'Exception',
    severity: 'medium',
    alertType: 'shipmentMessage',

    templatePath: 'alert/shipment-alert',
    
  }



]


const testAlertList = [

  // sayHello
  {
    tableName: 'shipment',
    alertCategory: 'Exception',
    severity: 'medium',
    alertType: 'sayHello',

    templatePath: 'alert/shipment-alert',
    
    handleAlertSubComponentLayoutName: 'alertForm.sayHello',

    // schedule: '0 * * * * *',

    interval: {
      value: 15,
      unit: 'MINUTE'
    },

    active: false,

    queryName: 'shipment',
    query: {
      subqueries: {
        moduleTypeCode: { value: ['AIR'] },
        boundTypeCode: { value: ['O'] },

        activeStatus: { value: 'active' }
      },

      limit: 10
    } as IQueryParams,

    closeQuery: {
      subqueries : {
        moduleTypeCode: { value: ['AIR'] },
        boundTypeCode: { value: ['O'] },
      }
    } as IQueryParams,
    

    // select only 1 person
    // extraPersonIdQuery: {
    //   subqueries: {
    //     userName: { value: 'marco.lor@swivelsoftware.com' }
    //   },
    //   
    // } as IQueryParams,


    contactRoleList: ['forwarder','personInCharge','office'],
    canCloseBy: [
      {
        type: 'all'
      }
    ],


    // flexDataConfig : {
    //   tableName : 'shipment',
    //   primaryKeyName : 'id',
    //   variableList : [
    //     {
    //       name : 'portOfLoadingCode'
    //     }
    //   ]
    // } as AlertFlexDataConfig




  } as AlertConfig,

]


const alertConfigList = [
  // just seperate into different list
  ...shipmentSeaAlertList,
  ...shipmentAirAlertList,
  ...oldAlertList,
  ...sopTaskAlertList,
  ...testAlertList,
  ...ASWAlertConfigList

] as AlertConfig[]

const alertPreferenceDetailList = [
  // {
  //   alertType: 'bookingMessage',
  //   notifyBy: 'email',
  //   active: true
  // },

  // {
  //   alertType: 'shipmentMessage',
  //   notifyBy: 'email',
  //   active: true
  // },

  // {
  //   alertType: 'shipmentEtaChanged',
  //   notifyBy: 'email',
  //   active: true
  // },

  // {
  //   alertType: 'shipmentEtdChanged',
  //   notifyBy: 'email',
  //   active: true
  // }

] as AlertPreferenceDetail[]


const alertFlexDataConfigList = [
  {
    tableName: 'booking',
    variableList: 'all',
    primaryKeyName: 'id',
  } as AlertFlexDataConfig,

  {
    tableName: 'shipment',
    primaryKeyName: 'id',
    variableList: 'all'
  } as AlertFlexDataConfig,

  //  {
  //   tableName : 'shipment',
  //   primaryKeyName : 'id',
  //   variableList : [

  //     {
  //       name : 'portOfLoadingCode'
  //     },
  //     {
  //       name : 'portOfDischargeCode'
  //     },

  //     {
  //       name: 'jobNo'
  //     },

  //     {
  //       name: 'masterNo'
  //     },

  //     {
  //       name: 'houseNo'
  //     },

  //     {
  //       name: 'jobDate'
  //     },

  //     {
  //       name: 'date',
  //       path: 'shipmentDate'
  //     },

  //     {
  //       name: 'dateInUtc',
  //       path: 'shipmentDateUtc'
  //     },

  //     {
  //       name: 'party',
  //       path: 'shipmentParty'
  //     }

  //   ]
  // } as AlertFlexDataConfig


] as AlertFlexDataConfig[]



export {
  schedulerActive,
  testMode,
  testAlertEmailList,
  alertConfigList,
  alertPreferenceDetailList,
  alertFlexDataConfigList
}