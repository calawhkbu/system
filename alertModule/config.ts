
import { AlertConfig, AlertFlexDataConfig } from 'modules/sequelize/interfaces/alert'
import { AlertPreferenceDetail } from 'modules/sequelize/interfaces/alertPreference'
import { IQueryParams } from 'classes/query'

export const schedulerActive = false


const shipmentSeaAlertList = [

  // cancelBookingAlert(SEA)
  {

    tableName: 'shipment',
    alertCategory: 'Exception',
    severity: 'medium',
    alertType: 'cancelBookingAlert(SEA)',

    templatePath: 'alert/shipment-alert',
    form: 'alert/shipment-alert',

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
      limit: 1
    },

    closeQuery: {
      subqueries : {
        cargoReceiptDateActualIsNotNull: true 
      }
    },


    contactRoleList: [],


  } as AlertConfig,

  // cargoDelayAlert(SEA)
  {

    tableName: 'shipment',
    alertCategory: 'Exception',
    severity: 'medium',
    alertType: 'cargoDelayAlert(SEA)',

    templatePath: 'alert/shipment-alert',
    form: 'alert/shipment-alert',

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
      limit: 1
    },

    closeQuery: {
      subqueries : {
        // have gateInDateActual
        gateInDateActualIsNotNull: true 
      }
    },

    contactRoleList: []
  },

  // cargoFailureToArrangeHualage(SEA)
  {

    tableName: 'shipment',
    alertCategory: 'Exception',
    severity: 'medium',
    alertType: 'cargoFailureToArrangeHualage(SEA)',

    templatePath: 'alert/shipment-alert',
    form: 'alert/shipment-alert',

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
      limit: 1
    },

    closeQuery: {
      subqueries : {
        // have sentToShipperDateActual
        sentToShipperDateActualIsNotNull: true 
      }
    },

    contactRoleList: []
  },

  // missingVGM(SEA)
  {

    tableName: 'shipment',
    alertCategory: 'Exception',
    severity: 'medium',
    alertType: 'missingVGM(SEA)',

    templatePath: 'alert/shipment-alert',
    form: 'alert/shipment-alert',

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
      limit: 1
    },

    closeQuery: {
      subqueries : {
        // have vgm non-zero
        vgmNonZeroQueryIdIn: true 
      }
    },


    contactRoleList: []
  },

  // missingEdi(SEA)
  {

    tableName: 'shipment',
    alertCategory: 'Exception',
    severity: 'medium',
    alertType: 'missingEdi(SEA)',

    templatePath: 'alert/shipment-alert',
    form: 'alert/shipment-alert',

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
      limit: 1
    },

    closeQuery: {
      subqueries : {
        // have ediSendDateActual
        ediSendDateActualIsNotNull: true 
      }
    },

    contactRoleList: []
  },

  // missingPreAlert(SEA)
  {

    tableName: 'shipment',
    alertCategory: 'Exception',
    severity: 'medium',
    alertType: 'missingPreAlert(SEA)',

    templatePath: 'alert/shipment-alert',
    form: 'alert/shipment-alert',

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
      limit: 1
    },

    closeQuery: {
      subqueries : {
        // have preAlertSendDateActual
        preAlertSendDateActualIsNotNull: true 
      }
    },


    contactRoleList: []
  },

  // missingMBL(SEA)
  {
    tableName: 'shipment',
    alertCategory: 'Exception',
    severity: 'medium',
    alertType: 'missingMBL(SEA)',

    templatePath: 'alert/shipment-alert',
    form: 'alert/shipment-alert',

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
      limit: 1
    },

    closeQuery: {
      subqueries : {
        // have masterBillReleasedDateActual
        masterBillReleasedDateActualIsNotNull: true 
      }
    },

    contactRoleList: []

  },

  // missingHBL(SEA)
  {
    tableName: 'shipment',
    alertCategory: 'Exception',
    severity: 'medium',
    alertType: 'missingHBL(SEA)',

    templatePath: 'alert/shipment-alert',
    form: 'alert/shipment-alert',

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
      limit: 1
    },

    closeQuery: {
      subqueries : {
        // have houseBillConfirmationDateActual
        houseBillConfirmationDateActualIsNotNull: true 
      }
    },


    contactRoleList: []

  },

  // demurrageWarning(SEA)
  {
    tableName: 'shipment',
    alertCategory: 'Exception',
    severity: 'medium',
    alertType: 'missingHBL(SEA)',

    templatePath: 'alert/shipment-alert',
    form: 'alert/shipment-alert',

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
      limit: 1
    },

    closeQuery: {
      subqueries : {
        // have arrivalAtDepotActual
        arrivalAtDepotActualIsNotNull: true 
      }
    },


    contactRoleList: []

  },

  // demurrageAlert(SEA)
  {
    tableName: 'shipment',
    alertCategory: 'Exception',
    severity: 'medium',
    alertType: 'demurrageAlert(SEA)',

    templatePath: 'alert/shipment-alert',
    form: 'alert/shipment-alert',

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
      limit: 1
    },

    closeQuery: {
      subqueries : {
        // have pickupCargoBeforeDemurrageDateActual_Or_cargoPickupWithDemurrageDateActual
        pickupCargoBeforeDemurrageDateActual_Or_cargoPickupWithDemurrageDateActualIsNotNull: true 
      }
    },


    contactRoleList: []

  },

  // detentionWarning(SEA)
  {
    tableName: 'shipment',
    alertCategory: 'Exception',
    severity: 'medium',
    alertType: 'detentionWarning(SEA)',

    templatePath: 'alert/shipment-alert',
    form: 'alert/shipment-alert',

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
      limit: 1
    },


    closeQuery: {
      subqueries : {
        // have returnEmptyContainerDateActual
        returnEmptyContainerDateActualIsNotNull: true 
      }
    },

    contactRoleList: []

  },

  // detentionAlert(SEA)
  {
    tableName: 'shipment',
    alertCategory: 'Exception',
    severity: 'medium',
    alertType: 'detentionAlert(SEA)',

    templatePath: 'alert/shipment-alert',
    form: 'alert/shipment-alert',

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
      limit: 1
    },

    closeQuery: {
      subqueries : {
        // have returnEmptyContainerDateActual
        returnEmptyContainerDateActualIsNotNull: true 
      }
    },

    contactRoleList: []

  },

  // missingDeliveryArrangement(SEA)
  {
    tableName: 'shipment',
    alertCategory: 'Exception',
    severity: 'medium',
    alertType: 'missingDeliveryArrangement(SEA)',

    templatePath: 'alert/shipment-alert',
    form: 'alert/shipment-alert',

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
      limit: 1
    },

    closeQuery: {
      subqueries : {
        // have finalDoorDeliveryDateActual
        finalDoorDeliveryDateActualIsNotNull: true 
      }
    },


    contactRoleList: []

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
    form: 'alert/shipment-alert',

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
        masterBillReleasedDateActualInUtc_Or_masterBillReleasedDateEstimatedInUtc: {
          value: {
            value: 3,
            unit: 'HOUR'
          }
        },

      },
      limit: 1
    },


    closeQuery: {
      subqueries : {
        // have preAlertSendDateActual
        preAlertSendDateActualIsNotNull: true 
      }
    },


    contactRoleList: []
  },

  // cargoDelayAlert(AIR)
  {

    tableName: 'shipment',
    alertCategory: 'Exception',
    severity: 'medium',
    alertType: 'cargoDelayAlert(AIR)',

    templatePath: 'alert/shipment-alert',
    form: 'alert/shipment-alert',

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
        cargoReceiptDateActualInUtc_Or_cargoReceiptDateEstimatedInUtc: {
          value: {
            value: -1,
            unit: 'DAY'
          }
        },

      },
      limit: 1
    },

    closeQuery: {
      subqueries : {
        // have preAlertSendDateActual
        preAlertSendDateActualIsNotNull: true 
      }
    },

    contactRoleList: []
  },

  // missingDeliveryArrangement(AIR)
  {

    tableName: 'shipment',
    alertCategory: 'Exception',
    severity: 'medium',
    alertType: 'missingDeliveryArrangement(AIR)',

    templatePath: 'alert/shipment-alert',
    form: 'alert/shipment-alert',

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
        arrivalDateActualInUtc_Or_arrivalDateEstimatedInUtc: {
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
      limit: 1
    },

    closeQuery: {
      subqueries : {
        // have portOfLoadingCode
        portOfLoadingCodeIsNotNull: true 
      }
    },

    contactRoleList: []
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
    form: 'alert/shipment-alert',
  },

  // shipmentArrivalDelayed(SEA)
  {

    tableName: 'shipment',
    alertCategory: 'Exception',
    severity: 'medium',
    alertType: 'shipmentArrivalDelayed(SEA)',

    templatePath: 'alert/shipment-alert',
    form: 'alert/shipment-alert',
  },

  // shipmentDepartureDelayed(AIR)
  {

    tableName: 'shipment',
    alertCategory: 'Exception',
    severity: 'medium',
    alertType: 'shipmentDepartureDelayed(AIR)',

    templatePath: 'alert/shipment-alert',
    form: 'alert/shipment-alert',
  },

  // shipmentDepartureDelayed(SEA)
  {

    tableName: 'shipment',
    alertCategory: 'Exception',
    severity: 'medium',
    alertType: 'shipmentDepartureDelayed(SEA)',

    templatePath: 'alert/shipment-alert',
    form: 'alert/shipment-alert',
  },

  // shipmentEtaChanged
  {

    tableName: 'shipment',
    alertCategory: 'Exception',
    severity: 'medium',
    alertType: 'shipmentEtaChanged',

    templatePath: 'alert/shipment-alert',
    form: 'alert/shipment-alert',
  },

  // shipmentEtdChanged
  {

    tableName: 'shipment',
    alertCategory: 'Exception',
    severity: 'medium',
    alertType: 'shipmentEtdChanged',

    templatePath: 'alert/shipment-alert',
    form: 'alert/shipment-alert',
  },


  // shipmentAtaChanged
  {

    tableName: 'shipment',
    alertCategory: 'Exception',
    severity: 'medium',
    alertType: 'shipmentAtaChanged',

    templatePath: 'alert/shipment-alert',
    form: 'alert/shipment-alert',
  },

  // shipmentAtdChanged
  {

    tableName: 'shipment',
    alertCategory: 'Exception',
    severity: 'medium',
    alertType: 'shipmentAtdChanged',

    templatePath: 'alert/shipment-alert',
    form: 'alert/shipment-alert',
  },

  // shipmentMessage
  {

    tableName: 'shipment',
    alertCategory: 'Exception',
    severity: 'medium',
    alertType: 'shipmentMessage',

    templatePath: 'alert/shipment-alert',
    form: 'alert/shipment-alert',
  }



]

const testAlertList = [

  // sayHello
  {
    tableName: 'shipment',
    alertCategory: 'Exception',
    severity: 'medium',
    alertType: 'sayHello',

    templatePath: 'message/shipment-message',
    
    // form: 'alert.sayHello',

    // schedule: '0 * * * * *',

    interval: {
      value: 15,
      unit: 'MINUTE'
    },

    active: true,

    canCloseBy: [
      {
        type: 'all'
      }

    ],

    queryName: 'shipment',
    query: {
      subqueries: {
        moduleTypeCode: { value: ['AIR'] },
        boundTypeCode: { value: ['O'] },

        activeStatus: { value: 'active' }
      },

      limit: 4
    } as IQueryParams,

    closeQuery: {
      subqueries : {
        moduleTypeCode: { value: ['AIR'] },
        boundTypeCode: { value: ['O'] },
      }
    } as IQueryParams,
    

    // select only 1 person
    extraPersonIdQuery: {
      subqueries: {
        userName: { value: 'marco.lor@swivelsoftware.com' }
      },
      limit: 1
    } as IQueryParams,

    // contactRoleList: ['shipper', 'consignee'],
    contactRoleList: [],

    // saveAsNewAlertTimeDiff : 0,

    resend: true, // resend to everyone or just send to those not yet receive


    flexDataConfig : {
      tableName : 'shipment',
      primaryKeyName : 'id',
      variableList : [
        {
          name : 'portOfLoadingCode'
        }
      ]
    }




  } as AlertConfig,

]


export const alertConfigList = [
  // just seperate into different list
  // ...shipmentSeaAlertList,
  // ...shipmentAirAlertList,
  // ...oldAlertList,

  ...testAlertList

] as AlertConfig[]

export const alertPreferenceDetailList = [
  {
    alertType: 'bookingMessage',
    notifyBy: 'email',
    active: false
  },

  {
    alertType: 'shipmentMessage',
    notifyBy: 'email',
    active: false
  },

  {
    alertType: 'shipmentEtaChanged',
    notifyBy: 'email',
    active: false
  },

  {
    alertType: 'shipmentEtdChanged',
    notifyBy: 'email',
    active: false
  }

] as AlertPreferenceDetail[]

export const alertFlexDataConfigList = [
  {
    tableName: 'booking',
    variableList: 'all',
    primaryKeyName: 'id',
  } as AlertFlexDataConfig,

  {
    tableName: 'shipment',
    primaryKeyName: 'id',
    variableList: 'all'
  } as AlertFlexDataConfig

] as AlertFlexDataConfig[]
