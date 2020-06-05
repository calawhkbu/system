
import { AlertConfig, AlertFlexDataConfig } from 'modules/sequelize/interfaces/alert'
import { AlertPreferenceDetail } from 'modules/sequelize/interfaces/alertPreference'
import { IQueryParams } from 'classes/query'

export const schedulerActive = false


const shipmentSeaAlert = [

  // cancelBookingAlert(SEA)
  {

    tableName: 'shipment',
    alertCategory: 'Exception',
    severity: 'medium',
    alertType: 'cancelBookingAlert(SEA)',

    templatePath: 'alert/shipment-alert',
    formPath: 'alert/shipment-alert',

    schedule: '0 * * * * *',
    active: false,

    query: {

      subqueries: {

        moduleTypeCode: {
          value: 'SEA'
        },

        // missing cargoReceiptDateActual
        cargoReceiptDateActualIsNull: true,

        // after after_cargoReadyDateActual / cargoReadyDateEstimated + 2 day
        after_cargoReadyDateActual_Or_cargoReadyDateEstimated: {
          value: {
            mode: 'add',
            value: 2,
            unit: 'DAY'
          }
        },

      },
      limit: 1
    }
  },

  // cargoDelayAlert(SEA)
  {

    tableName: 'shipment',
    alertCategory: 'Exception',
    severity: 'medium',
    alertType: 'cargoDelayAlert(SEA)',

    templatePath: 'alert/shipment-alert',
    formPath: 'alert/shipment-alert',

    schedule: '0 * * * * *',
    active: false,

    query: {

      subqueries: {

        moduleTypeCode: {
          value: 'SEA'
        },

        // missing gateInDateActual
        gateInDateActualIsNull: true,

        // after cYCutOffDateActual / cYCutOffDateEstimated + 2 day
        after_cYCutOffDateActual_Or_cYCutOffDateEstimated: {
          value: {
            mode: 'add',
            value: 1,
            unit: 'DAY'
          }
        },

      },
      limit: 1
    }
  },

  // cargoFailureToArrangeHualage(SEA)
  {

    tableName: 'shipment',
    alertCategory: 'Exception',
    severity: 'medium',
    alertType: 'cargoFailureToArrangeHualage(SEA)',

    templatePath: 'alert/shipment-alert',
    formPath: 'alert/shipment-alert',

    schedule: '0 * * * * *',
    active: false,

    query: {

      subqueries: {

        moduleTypeCode: {
          value: 'SEA'
        },

        // missing sentToShipperDateActual
        sentToShipperDateActualIsNull: true,

        // after cYCutOffDateActual / cYCutOffDateEstimated - 2 day
        after_cYCutOffDateActual_Or_cYCutOffDateEstimated: {
          value: {
            mode: 'before',
            value: 2,
            unit: 'DAY'
          }
        },

      },
      limit: 1
    }
  },

  // missingVGM(SEA)
  {

    tableName: 'shipment',
    alertCategory: 'Exception',
    severity: 'medium',
    alertType: 'missingVGM(SEA)',

    templatePath: 'alert/shipment-alert',
    formPath: 'alert/shipment-alert',

    schedule: '0 * * * * *',
    active: false,

    query: {

      subqueries: {

        moduleTypeCode: {
          value: 'SEA'
        },

        // missing VGM in any one of the shipment container
        // warning : current now just check shipment that with at least one container
        missingVGM: true,

        // after cYCutOffDateActual / cYCutOffDateEstimated - 1 day
        after_cYCutOffDateActual_Or_cYCutOffDateEstimated: {
          value: {
            mode: 'before',
            value: 1,
            unit: 'DAY'
          }
        },

      },
      limit: 1
    }
  },

  // missingEdi(SEA)
  {

    tableName: 'shipment',
    alertCategory: 'Exception',
    severity: 'medium',
    alertType: 'missingEdi(SEA)',

    templatePath: 'alert/shipment-alert',
    formPath: 'alert/shipment-alert',

    schedule: '0 * * * * *',
    active: false,

    query: {

      subqueries: {

        moduleTypeCode: {
          value: 'SEA'
        },

        // missing preAlertSendDateActual
        ediSendDateActualIsNull: true,


        // after ATD / ETD -1 day
        after_departureDateActual_Or_departureDateEstimated: {
          value: {
            mode: 'sub',
            value: 1,
            unit: 'DAY'
          }
        },

        // until ATA
        before_arrivalDateActual: {
          value: {
            value: 0,
            includeNull: true
          }
        }

      },
      limit: 1
    }
  },

  // missingPreAlert(SEA)
  {

    tableName: 'shipment',
    alertCategory: 'Exception',
    severity: 'medium',
    alertType: 'missingPreAlert(SEA)',

    templatePath: 'alert/shipment-alert',
    formPath: 'alert/shipment-alert',

    schedule: '0 * * * * *',
    active: false,

    query: {

      subqueries: {

        moduleTypeCode: {
          value: 'SEA'
        },

        // missing preAlertSendDateActual
        preAlertSendDateActualIsNull: true,

        // after ATD / ETD + 2 day
        after_departureDateActual_Or_departureDateEstimated: {
          value: {
            mode: 'add',
            value: 2,
            unit: 'DAY'
          }
        },

        // before ATA
        before_arrivalDateActual: {
          value: {
            value: 0,
            includeNull : true
          }
        }
      },
      limit: 1
    }
  },

  // missingMBL(SEA)
  {
    tableName: 'shipment',
    alertCategory: 'Exception',
    severity: 'medium',
    alertType: 'missingMBL(SEA)',

    templatePath: 'alert/shipment-alert',
    formPath: 'alert/shipment-alert',

    schedule: '0 * * * * *',
    active: false,

    query: {

      subqueries: {

        moduleTypeCode: {
          value: 'SEA'
        },


        // missing masterBillReleasedDateActual
        masterBillReleasedDateActualIsNull: true,

        // after ATD / ETD + 1 day
        after_departureDateActual_Or_departureDateEstimated: {
          value: {
            mode: 'add',
            value: 1,
            unit: 'DAY'
          }
        },

        // until ATA
        before_arrivalDateActual: {
          value: {
            value: 0,
            includeNull : true
          }
        }

      },
      limit: 1
    }

  },

  // missingHBL(SEA)
  {
    tableName: 'shipment',
    alertCategory: 'Exception',
    severity: 'medium',
    alertType: 'missingHBL(SEA)',

    templatePath: 'alert/shipment-alert',
    formPath: 'alert/shipment-alert',

    schedule: '0 * * * * *',
    active: false,

    query: {

      subqueries: {

        moduleTypeCode: {
          value: 'SEA'
        },

        // missing houseBillConfirmationDateActual
        houseBillConfirmationDateActualIsNull: true,

        // after ATD / ETD + 2 day
        after_departureDateActual_Or_departureDateEstimated: {
          value: {
            mode: 'add',
            value: 2,
            unit: 'DAY'
          }
        },

        // until ATA
        before_arrivalDateActual: {
          value: {
            value: 0,
            includeNull : true
          }
        }

      },
      limit: 1
    }

  },

  // demurrageWarning(SEA)
  {
    tableName: 'shipment',
    alertCategory: 'Exception',
    severity: 'medium',
    alertType: 'missingHBL(SEA)',

    templatePath: 'alert/shipment-alert',
    formPath: 'alert/shipment-alert',

    schedule: '0 * * * * *',
    active: false,

    query: {

      subqueries: {

        moduleTypeCode: {
          value: 'SEA'
        },


        // missing arrivalAtDepotActual
        arrivalAtDepotActualIsNull: true,

        // after ATA / ETA + 2 DAY
        after_arrivalDateActual_Or_arrivalDateEstimated: {
          value: {
            mode: 'add',
            value: 2,
            unit: 'DAY'
          }
        },

        // until before_finalDoorDeliveryActual
        before_finalDoorDeliveryActual: {
          value: {
            value: 0,
            includeNull : true
          }
        }

      },
      limit: 1
    }

  },

  // demurrageAlert(SEA)
  {
    tableName: 'shipment',
    alertCategory: 'Exception',
    severity: 'medium',
    alertType: 'demurrageAlert(SEA)',

    templatePath: 'alert/shipment-alert',
    formPath: 'alert/shipment-alert',

    schedule: '0 * * * * *',
    active: false,

    query: {

      subqueries: {

        moduleTypeCode: {
          value: 'SEA'
        },

        // missing pickupCargoBeforeDemurrageDateActual / cargoPickupWithDemurrageDateActual
        pickupCargoBeforeDemurrageDateActual_Or_cargoPickupWithDemurrageDateActualIsNull: true,

        // after ATA / ETA + 5 days
        after_arrivalDateActual_Or_arrivalDateEstimated: {
          value: {
            mode: 'add',
            value: 5,
            unit: 'DAY'
          }
        },

        // before finalDoorDeliveryActual
        before_finalDoorDeliveryActual: {
          value: {
            value: 0,
            includeNull : true
          }
        }

      },
      limit: 1
    }

  },

  // detentionWarning(SEA)
  {
    tableName: 'shipment',
    alertCategory: 'Exception',
    severity: 'medium',
    alertType: 'detentionWarning(SEA)',

    templatePath: 'alert/shipment-alert',
    formPath: 'alert/shipment-alert',

    schedule: '0 * * * * *',
    active: false,

    query: {

      subqueries: {

        moduleTypeCode: {
          value: 'SEA'
        },

        // missing returnEmptyContainerDateActual
        returnEmptyContainerDateActualIsNull: true,

        // after sendToConsigneeDateActual / sendToConsigneeDateEstimated + 3 days
        after_sendToConsigneeDateActual_Or_sendToConsigneeDateEstimated: {
          value: {
            mode: 'add',
            value: 3,
            unit: 'DAY'
          }
        }
      },
      limit: 1
    }

  },

  // detentionAlert(SEA)
  {
    tableName: 'shipment',
    alertCategory: 'Exception',
    severity: 'medium',
    alertType: 'detentionAlert(SEA)',

    templatePath: 'alert/shipment-alert',
    formPath: 'alert/shipment-alert',

    schedule: '0 * * * * *',
    active: false,

    query: {

      subqueries: {

        moduleTypeCode: {
          value: 'SEA'
        },

        // missing returnEmptyContainerDateActual
        returnEmptyContainerDateActualIsNull: true,

        // after sendToConsigneeDateActual / sendToConsigneeDateEstimated + 6 days
        after_sendToConsigneeDateActual_Or_sendToConsigneeDateEstimated: {
          value: {
            mode: 'add',
            value: 6,
            unit: 'DAY'
          }
        }
      },
      limit: 1
    }

  },

  // missingDeliveryArrangement(SEA)
  {
    tableName: 'shipment',
    alertCategory: 'Exception',
    severity: 'medium',
    alertType: 'missingDeliveryArrangement(SEA)',

    templatePath: 'alert/shipment-alert',
    formPath: 'alert/shipment-alert',

    schedule: '0 * * * * *',
    active: false,

    query: {

      subqueries: {

        moduleTypeCode: {
          value: 'SEA'
        },

        // missing finalDoorDeliveryDateActual
        finalDoorDeliveryDateActualIsNull: true,

        // ATA / ETA + 14 DAY
        after_arrivalDateActual_Or_arrivalDateEstimated: {
          value: {
            mode: 'add',
            value: 14,
            unit: 'DAY'
          }
        },

        // until finalDoorDeliveryActual
        before_finalDoorDeliveryActual: {
          value: {
            value: 0,
            includeNull : true
          }
        }

      },
      limit: 1
    }

  }

]

const shipmentAirAlert = [

  // missingPreAlert(AIR)
  {

    tableName: 'shipment',
    alertCategory: 'Exception',
    severity: 'medium',
    alertType: 'missingPreAlert(AIR)',

    templatePath: 'alert/shipment-alert',
    formPath: 'alert/shipment-alert',

    schedule: '0 * * * * *',
    active: false,

    query: {

      subqueries: {

        moduleTypeCode: {
          value: 'AIR'
        },

        // missing preAlertSendDateActual
        preAlertSendDateActualIsNull: true,

        // after masterBillReleasedDateActual / masterBillReleasedDateEstimated + 3 hour
        masterBillReleasedDateActual_Or_masterBillReleasedDateEstimated: {
          value: {
            mode: 'add',
            value: 3,
            unit: 'HOUR'
          }
        },

      },
      limit: 1
    }
  },

  // cargoDelayAlert(AIR)
  {

    tableName: 'shipment',
    alertCategory: 'Exception',
    severity: 'medium',
    alertType: 'cargoDelayAlert(AIR)',

    templatePath: 'alert/shipment-alert',
    formPath: 'alert/shipment-alert',

    schedule: '0 * * * * *',
    active: false,

    query: {

      subqueries: {

        moduleTypeCode: {
          value: 'AIR'
        },

        // missing preAlertSendDateActual
        preAlertSendDateActualIsNull: true,

        // after cargoReceiptDateActual / cargoReceiptDateEstimated - 1 day
        cargoReceiptDateActual_Or_cargoReceiptDateEstimated: {
          value: {
            mode: 'sub',
            value: 1,
            unit: 'DAY'
          }
        },

      },
      limit: 1
    }
  },

  // missingDeliveryArrangement(AIR)
  {

    tableName: 'shipment',
    alertCategory: 'Exception',
    severity: 'medium',
    alertType: 'missingDeliveryArrangement(AIR)',

    templatePath: 'alert/shipment-alert',
    formPath: 'alert/shipment-alert',

    schedule: '0 * * * * *',
    active: false,

    query: {

      subqueries: {

        moduleTypeCode: {
          value: 'AIR'
        },

        // missing portOfLoadingCode
        portOfLoadingCodeIsNull: true,

        // after arrivalDateActual / arrivalDateEstimated + 1 day
        arrivalDateActual_Or_arrivalDateEstimated: {
          value: {
            mode: 'add',
            value: 1,
            unit: 'DAY'
          }
        },

        // until 30 days after ATA
        before_arrivalDateActual : {
          value: {
            mode: 'add',
            value: 30,
            unit: 'DAY',
            includeNull: true
          }

        }

      },
      limit: 1
    }
  },

]


export const alertConfigList = [
  // sayHello
  {
    tableName: 'shipment',
    alertCategory: 'Exception',
    severity: 'medium',
    alertType: 'sayHello',

    templatePath: 'message/shipment-message',
    formPath : 'alert.sayHello',

    schedule: '0 * * * * *',

    active: false,

    canCloseBy : [
      {
        type : 'all'
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

  } as AlertConfig,


  // just seperate into different list
  ...shipmentSeaAlert,
  ...shipmentAirAlert

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
