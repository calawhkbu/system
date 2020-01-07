
import { AlertConfig, AlertFlexDataConfig } from 'models/main/alert'
import { AlertPreference, AlertPreferenceDetail } from 'models/main/alertPreference'
import { IQueryParams } from 'classes/query'

export const schedulerActive = false

export const alertConfigList = [

  {
    alertCategory: 'Notification',
    alertType: 'newBooking',
    tableName: 'booking',
    templatePath: 'message/new-booking-preview',
    severity: 'medium',
    contactRoleList: 'all',

    active : true

  } as AlertConfig,
  {

    tableName: 'shipment',
    alertCategory: 'Exception',
    severity: 'medium',
    alertType: 'sayHello',

    templatePath : 'message/shipment-message',

    schedule: '0 * * ? * *',
    queryName : 'shipment',
    query: {
      subqueries: {
        moduleTypeCode: { value: ['AIR'] },
        boundTypeCode: { value: ['O'] },
      },
      limit: 1

    } as IQueryParams,

    extraPersonIdQuery : {
      subqueries: {
      },
      limit : 1
    } as IQueryParams,

    contactRoleList: ['shipper', 'consignee'],

    // saveAsNewAlertTimeDiff : 0,

    resend : true, // resend to everyone or just send to those not yet receive

    active: true

  } as AlertConfig

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
    variableList: [
      'partyGroupCode',
      'bookingNo',
      'moduleTypeCode',
      'boundTypeCode',
      'agentPartyId',
      'forwarderPartyId',
      'notifyPartyPartyId',
      'shipperPartyId',
      'consigneePartyId'
    ],
    primaryKeyName : 'id'
  },

  {
    tableName: 'shipment',
    primaryKeyName : 'id',
    variableList: 'all'
  }

] as AlertFlexDataConfig[]
