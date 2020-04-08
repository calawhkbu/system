
import { AlertConfig, AlertFlexDataConfig, Alert } from 'models/main/alert'
import { AlertPreference, AlertPreferenceDetail } from 'models/main/alertPreference'
import { IQueryParams } from 'classes/query'
import { BinaryExpression, ColumnExpression, IConditionalExpression, AndExpressions, MathExpression, ParameterExpression, FunctionExpression, BetweenExpression, Value, IsNullExpression } from 'node-jql'
import { ShipmentService } from 'modules/sequelize/shipment/services/shipment'
import { JwtPayload } from 'modules/auth/interfaces/jwt-payload'

export const schedulerActive = false

export const alertConfigList = [

  {
    alertCategory: 'Notification',
    alertType: 'newBooking',
    tableName: 'booking',
    templatePath: 'message/new-booking-preview',
    severity: 'medium',
    contactRoleList: 'all'
  } as AlertConfig,

  // Alert for message (booking / shipment)
  {
    alertCategory: 'Message',
    alertType: 'bookingMessage',
    tableName: 'booking',
    templatePath: 'message/booking-message',
    severity: 'medium',
    contactRoleList: 'all'
  } as AlertConfig,

  {
    alertCategory: 'Message',
    alertType: 'shipmentMessage',
    tableName: 'shipment',
    templatePath: 'message/shipment-message',
    severity: 'medium',
    contactRoleList: 'all'

  } as AlertConfig,

  // missingCarrierBooking
  {
    tableName: 'shipment',
    alertCategory: 'Exception',
    alertType: 'missingCarrierBooking',
    templatePath: 'alert/shipment-alert',
    severity: 'medium',
    contactRoleList: ['shipper', 'consignee', 'createUser'],

    schedule: '0 * * ? * *',
    active: false,

    queryName: 'shipment',
    query: {
      subqueries: {
        statusJoin: true,
        statusCode: {
          value: ['STSP', 'RCS']
        }
      },

      conditions: new AndExpressions([
        new BinaryExpression(
          new FunctionExpression('NOW'),
          '>=',
          new FunctionExpression(
            'DATE_ADD',
            new ColumnExpression('shipment_date', 'departureDateEstimated'),
            new ParameterExpression({
              prefix: 'INTERVAL',
              expression: new Value(7),
              suffix: 'DAY',
            })
          ),
        ),
      ])

    } as IQueryParams,

    // all those with statusCode STSP/RCS will be OK
    closeQuery : {
      subqueries : {
        statusJoin: true,
        statusCode: {
          value: ['STSP', 'RCS']
        }
      }
    } as IQueryParams

  } as AlertConfig,

  // customsCompliance(SEA)
  {

    tableName: 'shipment',
    alertCategory: 'Exception',
    alertType: 'customsCompliance(SEA)',
    templatePath: 'alert/shipment-alert',
    severity: 'medium',
    contactRoleList: [],

    schedule: '0 * * ? * *',
    active: false,

    queryName: 'shipment',
    query: {

      fields: ['id'],
      subqueries: {
        moduleTypeCode: {
          value: ['SEA']
        },
        statusJoin: true,
        statusCode: {
          value: ['DLPT']
        }
      },

      conditions: new AndExpressions([

        new IsNullExpression(new ColumnExpression('shipment_date', 'edisendDateActual'), false),

        new BinaryExpression(
          new FunctionExpression('NOW'),
          '>=',
          new FunctionExpression(
            'DATE_ADD',
            new ColumnExpression('shipment_date', 'ediSendDateActual'),
            new ParameterExpression({
              prefix: 'INTERVAL',
              expression: new Value(48),
              suffix: 'HOUR',
            })
          ),
        ),
      ])

    } as IQueryParams

  },

  // customersCompliance(AIR)
  {

    tableName: 'shipment',
    alertCategory: 'Exception',
    alertType: 'customsCompliance(AIR)',
    templatePath: 'alert/shipment-alert',
    severity: 'medium',
    contactRoleList: [],

    schedule: '0 * * ? * *',
    active: false,

    queryName: 'shipment',
    query: {

      fields: ['id'],
      subqueries: {
        moduleTypeCode: {
          value: ['AIR']
        },
        statusJoin: true,
        statusCode: {
          value: ['DEP']
        }
      },

      conditions: new AndExpressions([

        new IsNullExpression(new ColumnExpression('shipment_date', 'edisendDateActual'), false),

        new BinaryExpression(
          new FunctionExpression('NOW'),
          '>=',
          new FunctionExpression(
            'DATE_ADD',
            new ColumnExpression('shipment_date', 'ediSendDateActual'),
            new ParameterExpression({
              prefix: 'INTERVAL',
              expression: new Value(2),
              suffix: 'HOUR',
            })
          ),
        ),
      ])

    } as IQueryParams

  },

  // preAlertCompliance(SEA)
  {

    tableName: 'shipment',
    alertCategory: 'Exception',
    alertType: 'preAlertCompliance(SEA)',
    templatePath: 'alert/shipment-alert',
    severity: 'medium',
    contactRoleList: [],

    schedule: '0 * * ? * *',
    active: false,

    queryName: 'shipment',
    query: {

      fields: ['id'],
      subqueries: {
        moduleTypeCode: {
          value: ['SEA']
        },
        statusJoin: true,
        statusCode: {
          value: ['DLPT']
        }
      },

      conditions: new AndExpressions([

        new IsNullExpression(new ColumnExpression('shipment_date', 'preAlertsendDateActual'), false),

        new BinaryExpression(
          new FunctionExpression('NOW'),
          '>=',
          new FunctionExpression(
            'DATE_ADD',
            new ColumnExpression('shipment_date', 'preAlertsendDateActual'),
            new ParameterExpression({
              prefix: 'INTERVAL',
              expression: new Value(2),
              suffix: 'DAY',
            })
          ),
        ),
      ])

    } as IQueryParams

  },

  // preAlertCompliance(AIR)
  {

    tableName: 'shipment',
    alertCategory: 'Exception',
    alertType: 'preAlertCompliance(AIR)',
    templatePath: 'alert/shipment-alert',
    severity: 'medium',
    contactRoleList: [],

    schedule: '0 * * ? * *',
    active: false,

    queryName: 'shipment',
    query: {

      fields: ['id'],
      subqueries: {

        isDirect : {
          value : [0]
        },
        moduleTypeCode: {
          value: ['AIR']
        },
        statusJoin: true,
        statusCode: {
          value: ['DEP']
        }
      },

      conditions: new AndExpressions([

        new IsNullExpression(new ColumnExpression('shipment_date', 'preAlertsendDateActual'), false),

        new BinaryExpression(
          new FunctionExpression('NOW'),
          '>=',
          new FunctionExpression(
            'DATE_ADD',
            new ColumnExpression('shipment_date', 'preAlertsendDateActual'),
            new ParameterExpression({
              prefix: 'INTERVAL',
              expression: new Value(2),
              suffix: 'DAY',
            })
          ),
        ),
      ])

    } as IQueryParams

  },

  // billComplianceWarning ?
  {
    tableName: 'shipment',
    alertCategory: 'Exception',
    alertType: 'billComplianceWarning',
    templatePath: 'alert/shipment-alert',
    severity: 'medium',
    contactRoleList: [],

    schedule: '0 * * ? * *',
    active: false,

    queryName: 'shipment',
    query: {

      fields: ['id'],
      subqueries: {
        statusJoin: true,
        statusCode: {
          value: ['BDAR', 'ARR']
        }
      },

      conditions: new AndExpressions([

        new IsNullExpression(new ColumnExpression('shipment_date', 'billingDateActual'), false),

        new BinaryExpression(
          new FunctionExpression('NOW'),
          '>=',
          new FunctionExpression(
            'DATE_ADD',
            new ColumnExpression('shipment_date', 'arrivalDateActual'),
            new ParameterExpression({
              prefix: 'INTERVAL',
              expression: new Value(5),
              suffix: 'DAY',
            })
          ),
        ),
      ])

    } as IQueryParams
  },

  // billComplianceAlert ?
  {
    tableName: 'shipment',
    alertCategory: 'Exception',
    alertType: 'billComplianceAlert',
    templatePath: 'alert/shipment-alert',
    severity: 'medium',
    contactRoleList: [],

    schedule: '0 * * ? * *',
    active: false,

    queryName: 'shipment',
    query: {

      fields: ['id'],
      subqueries: {
        statusJoin: true,
        statusCode: {
          value: ['BDAR', 'ARR']
        }
      },

      conditions: new AndExpressions([

        new IsNullExpression(new ColumnExpression('shipment_date', 'billingDateActual'), false),

        new BinaryExpression(
          new FunctionExpression('NOW'),
          '>=',
          new FunctionExpression(
            'DATE_ADD',
            new ColumnExpression('shipment_date', 'arrivalDateActual'),
            new ParameterExpression({
              prefix: 'INTERVAL',
              expression: new Value(5),
              suffix: 'DAY',
            })
          ),
        ),
      ])

    } as IQueryParams
  },

  // NOA alert ?
  {
    tableName: 'shipment',
    alertCategory: 'Exception',
    alertType: 'NOAAlert',
    templatePath: 'alert/shipment-alert',
    severity: 'medium',
    contactRoleList: [],

    schedule: '0 * * ? * *',
    active: false,

    queryName: 'shipment',
    query: {

      fields: ['id'],
      subqueries: {
        statusJoin: true,
        statusCode: {
          value: ['BDAR', 'ARR']
        }
      },

      conditions: new AndExpressions([

        new IsNullExpression(new ColumnExpression('shipment_date', 'arrivalDateActual'), false),

        new BinaryExpression(
          new FunctionExpression('NOW'),
          '>=',
          new FunctionExpression(
            'DATE_ADD',
            new ColumnExpression('shipment_date', 'arrivalDateActual'),
            new ParameterExpression({
              prefix: 'INTERVAL',
              expression: new Value(5),
              suffix: 'DAY',
            })
          ),
        ),
      ])

    } as IQueryParams,

  },

  // billingComplianceActual
  {
    tableName: 'shipment',
    alertCategory: 'Exception',
    alertType: 'billingComplianceActual',
    templatePath: 'alert/shipment-alert',
    severity: 'medium',
    contactRoleList: [],

    schedule: '0 * * ? * *',
    active: false,

    queryName: 'shipment',
    query: {

      fields: ['id'],
      subqueries: {
        statusJoin: true,
        statusCode: {
          value: ['STCS', 'DLV']
        }
      },

      conditions: new AndExpressions([

        new BinaryExpression(
          new FunctionExpression('NOW'),
          '>=',
          new FunctionExpression(
            'DATE_ADD',
            new ColumnExpression('shipment_date', 'sentToConsigneeDateActual'),
            new ParameterExpression({
              prefix: 'INTERVAL',
              expression: new Value(5),
              suffix: 'DAY',
            })
          ),
        ),
      ])

    } as IQueryParams,

  },

  // for SEA
  // detentionWarning
  {
    tableName: 'shipment',
    alertCategory: 'Exception',
    alertType: 'detentionWarning',
    templatePath: 'alert/shipment-alert',
    severity: 'medium',
    contactRoleList: [],

    schedule: '0 * * ? * *',
    active: false,

    queryName: 'shipment',
    query: {

      fields: ['id'],
      subqueries: {
        moduleTypeCode : {
          value : ['SEA']
        },
        statusJoin: true,
        statusCode: {
          value: ['RCVE']
        }
      },

      conditions: new AndExpressions([

        new BinaryExpression(
          new FunctionExpression('NOW'),
          '>=',
          new FunctionExpression(
            'DATE_ADD',
            new ColumnExpression('shipment_date', 'sentToConsigneeDateActual'),
            new ParameterExpression({
              prefix: 'INTERVAL',
              expression: new Value(7),
              suffix: 'DAY',
            })
          ),
        ),
      ])

    } as IQueryParams,

  },

  // for SEA
  // detentionAlert
  {
    tableName: 'shipment',
    alertCategory: 'Exception',
    alertType: 'detentionAlert',
    templatePath: 'alert/shipment-alert',
    severity: 'medium',
    contactRoleList: [],

    schedule: '0 * * ? * *',
    active: false,

    queryName: 'shipment',
    query: {

      fields: ['id'],
      subqueries: {
        moduleTypeCode : {
          value : ['SEA']
        },
        statusJoin: true,
        statusCode: {
          value: ['RCVE']
        }
      },

      conditions: new AndExpressions([

        new BinaryExpression(
          new FunctionExpression('NOW'),
          '>=',
          new FunctionExpression(
            'DATE_ADD',
            new ColumnExpression('shipment_date', 'sentToConsigneeDateActual'),
            new ParameterExpression({
              prefix: 'INTERVAL',
              expression: new Value(5),
              suffix: 'DAY',
            })
          ),
        ),
      ])

    } as IQueryParams,

  },

  // for SEA
  // detentionActual
  {
    tableName: 'shipment',
    alertCategory: 'Exception',
    alertType: 'detentionActual',
    templatePath: 'alert/shipment-alert',
    severity: 'medium',
    contactRoleList: [],

    schedule: '0 * * ? * *',
    active: false,

    queryName: 'shipment',
    query: {

      fields: ['id'],
      subqueries: {
        moduleTypeCode : {
          value : ['SEA']
        },
        statusJoin: true,
        statusCode: {
          value: ['RCVE']
        }
      },

      conditions: new AndExpressions([

        new BinaryExpression(
          new FunctionExpression('NOW'),
          '>=',
          new FunctionExpression(
            'DATE_ADD',
            new ColumnExpression('shipment_date', 'sentToConsigneeDateActual'),
            new ParameterExpression({
              prefix: 'INTERVAL',
              expression: new Value(30),
              suffix: 'DAY',
            })
          ),
        ),
      ])

    } as IQueryParams,

  },

  // example of running function

  // {
  //   tableName : 'shipment',
  //   alertCategory : 'Exception',
  //   alertType : 'funcTest',
  //   templatePath: 'alert/shipment-alert',
  //   severity : 'medium',
  //   contactRoleList : [],

  //   schedule: '0 * * ? * *',
  //   active : false,

  //   query : async(alertConfig: AlertConfig, user: JwtPayload, allService: any) => {

  //     const shipmentService = allService.ShipmentService as ShipmentService
  //     return await shipmentService.find({

  //       where : {
  //         moduleTypeCode : 'AIR'
  //       },
  //     }, user )
  //   }

  // } as AlertConfig,

] as AlertConfig[]

export const alertPreferenceDetailList = [
  {
    alertType: 'bookingMessage',
    notifyBy: 'email',
    active: true
  },

  {
    alertType: 'shipmentMessage',
    notifyBy: 'email',
    active: true
  },

  {
    alertType: 'shipmentEtaChanged',
    notifyBy: 'email',
    active: true
  },

  {
    alertType: 'shipmentEtdChanged',
    notifyBy: 'email',
    active: true
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
