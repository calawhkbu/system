import { BaseEdiParser } from 'modules/edi/baseEdiParser'
import { CodeMasterService } from 'modules/sequelize/codeMaster/service'
import { ProductDbService } from 'modules/sequelize/product/service'
import { OutboundService } from 'modules/integration-hub/services/outbound'
import { SwivelConfigService } from 'modules/swivel-config/service'
import { PurchaseOrder } from 'models/main/purchaseOrder'
import { PurchaseOrderItem } from 'models/main/purchaseOrderItem'
import { LocationService } from 'modules/sequelize/location/service'
import { ProductDefinitionField, Product } from 'models/main/product'
import { JwtPayload } from 'modules/auth/interfaces/jwt-payload'
import { EdiSchedulerConfig, EdiFormatJson } from 'modules/edi/interface'

const moment = require('moment')

export const formatJson = {
  removeCharacter: [],
  segmentSeperator: ['?'],
  elementSeperator: [''],

  rootSegmentFormat: {
    type: 'object',
    segmentFormatList: [
      {
        key: 'ISA',
        code: 'ISA',
        name: 'interchange Control Header',
        type: 'object',
        mandatory: false,
        elementFormatList: [
          {
            index: 1,
            name: 'Authorization Info Qualifier',
            key: 'authorizationInfoQualifier',
            type: 'string',
          },
          {
            index: 2,
            name: 'Authorization Information',
            key: 'authorizationInformation',
            type: 'string',
          },
          {
            index: 3,
            name: 'Security Info Qualifier ',
            key: 'securityInfoQualifier ',
            type: 'string',
          },
          {
            index: 4,
            name: 'Security Information',
            key: 'securityInformation',
            type: 'string',
          },
          {
            index: 5,
            name: 'Interchange Sender ID QL',
            key: 'interchangeSenderIdQl',
            type: 'string',
          },
          {
            index: 6,
            name: 'Interchange Sender ID',
            key: 'interchangeSenderId',
            type: 'string',
          },
          {
            index: 7,
            name: 'Interchange Receiver QL',
            key: 'interchangeReceiverQl',
            type: 'string',
          },
          {
            index: 8,
            name: 'Interchange Receiver ID',
            key: 'interchangeReceiverId',
            type: 'string',
            allowableValues: {
              valueOptions: [
                {
                  value: '6112390050',
                  name: 'GXS',
                  overrideValue: 'GXS',
                },
                {
                  value: '6112391050',
                  name: 'Inovis',
                  overrideValue: 'Inovis',
                },
                {
                  value: '6112392050',
                  name: 'InterTrade',
                  overrideValue: 'InterTrade',
                },
              ],
              allowAny: true,
            },
          },
          {
            index: 9,
            name: 'Created Date',
            key: 'createdDate',
            type: 'date',
            format: 'yyMMdd',
          },
          {
            index: 10,
            name: 'Created Time',
            key: 'createdTime',
            type: 'time',
          },
          {
            index: 11,
            name: 'Interchange Standards ID',
            key: 'interchangeStandardsId',
            type: 'string',
          },
          {
            index: 12,
            name: 'Interchange Version ID',
            key: 'interchangeVersionId',
            type: 'string',
          },
          {
            index: 13,
            name: 'Interchange Control Number',
            key: 'interchangeControlNumber',
            type: 'string',
          },
          {
            index: 14,
            name: 'Acknowledgement Requested',
            key: 'acknowledgement Requested ',
            type: 'string',
          },
          {
            index: 15,
            name: 'Test Indicator',
            key: 'testIndicator',
            type: 'string',
            allowableValues: {
              valueOptions: [
                {
                  value: 'T',
                  name: 'Test',
                  overrideValue: 'Test',
                },
                {
                  value: 'P',
                  name: 'Prod',
                  overrideValue: 'Prod',
                },
              ],
              allowAny: true,
            },
          },
          {
            index: 16,
            name: 'Sub Element Separator',
            key: 'subElementSeparator',
            type: 'string',
          },
        ],
      },
      {
        key: 'GS',
        code: 'GS',
        name: 'Funtional Group Header',
        type: 'object',
        mandatory: false,
        elementFormatList: [
          {
            index: 1,
            name: 'Functional ID',
            key: 'functionalId',
            type: 'string',
          },
          {
            index: 2,
            name: 'Application Sender ID',
            key: 'applicationSenderId',
            allowableValues: {
              valueOptions: [
                {
                  value: '6112390050',
                  name: 'GXS',
                  overrideValue: 'GXS',
                },
                {
                  value: '6112391050',
                  name: 'Inovis',
                  overrideValue: 'Inovis',
                },
                {
                  value: '6112392050',
                  name: 'InterTrade',
                  overrideValue: 'InterTrade',
                },
              ],
              allowAny: true,
            },
            type: 'string',
          },
          {
            index: 3,
            name: 'Application Receiver ID',
            key: 'applicationReceiverId',
            type: 'string',
          },
          {
            index: 4,
            name: 'Data Interchange Date',
            key: 'dataInterchangeDate',
            type: 'date',
            Format: 'yyyyMMdd',
          },
          {
            index: 5,
            name: 'Data Interchange Time',
            key: 'dataInterchangeTime',
            type: 'time',
          },
          {
            index: 6,
            name: 'Data Interchange Control Number',
            key: 'dataInterchangeControlNumber',
            type: 'string',
          },
          {
            index: 7,
            name: 'Responsible Agency Code',
            key: 'responsibleAgencyCode',
            type: 'string',
          },
          {
            index: 8,
            name: 'Version ID',
            key: 'versionId',
            type: 'string',
          },
        ],
      },
    ],
  },
} as EdiFormatJson

export const schedulerConfig = {
  active: true,
  schedule: '0 * * ? * *',
  ediFile: {
    path: '/home/ec2-user/ftptest/',
    extensions: ['edi', 'txt'],
    storageConfig: {
      handlerName: 'sftp',
      config: {
        os: 'linux',

        host: '13.229.70.248',
        port: '22',
        username: 'ec2-user',

        privateKey: `privateKey`,
      },
    },
  },
  // the oubound name after parsing the edi
  outbound: 'someOutbound',
} as EdiSchedulerConfig

export default class EdiParser856 extends BaseEdiParser {
  constructor(
    protected readonly partyGroupCode: string,
    protected readonly type: string,
    protected readonly formatJson: any,
    protected readonly allService: any
  ) {
    super(partyGroupCode, type, formatJson, allService)
  }

  async export(entityJSON: any): Promise<any> {
    console.log(`export type  : ${entityJSON}`)
    console.log('=========================')
    const result = await super.export(entityJSON)

    console.log('.........................')
    return result
  }
}
