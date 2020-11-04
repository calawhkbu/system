import { DocumentStorageConfig, EntityConfig } from 'modules/sequelize/interfaces/document'
import { Shipment } from 'models/main/shipment'
import { Booking } from 'models/main/booking'

// usually should not call into here as each party should have their own sftp config
export const documentStorageConfig = {

  maxFileSize: 1048576,
  recyclePrefix: 'recycle',
  defaultHandlerName: 'sftp',

  // set this to true so that is will sarch by serverName
  searchServerName : true,

  handlerList: [
  ]

} as DocumentStorageConfig

export const entityConfigList = [
  {
    tableName : 'template',
    defaultDocumentConfig : {
      isActive : true,
      allowFileType: [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'url',
        'application/octet-stream'
      ],
      allowFillTemplate: false
    },
    documentList : []
  } as EntityConfig,
  {
    tableName: 'booking',
    defaultDocumentConfig: {
      isActive : true,
      allowFileType: [
        'image/png',
        'image/gif',
        'image/jpeg',
        'application/zip',
        'application/pdf',
        'application/msword',
        'application/vnd.ms-excel',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/vnd.oasis.opendocument.presentation',
        'application/vnd.oasis.opendocument.spreadsheet',
        'application/vnd.oasis.opendocument.text',
        'text/csv',
        'url',
        'application/octet-stream'
      ],
      allowFillTemplate: false
    },
    documentList: [
      {
        fileName: 'Freight Invoice',
        isActive : true,
        allowFillTemplate: false
      },
      {
        fileName: 'MBL',
        isActive : true,
        allowFillTemplate: false
      },
      {
        fileName: 'HBL Original',
        isActive : true,
        allowFillTemplate: false
      },
      {
        fileName: 'HBL Telex released',
        isActive : true,
        allowFillTemplate: false
      },
      {
        fileName: 'Commercial Invoice',
        isActive : true,
        allowFillTemplate: false
      },
      {
        fileName: 'Packing List',
        isActive : true,
        allowFillTemplate: false
      },
      {
        fileName: 'Quotation',
        isActive : true,
        allowFillTemplate: false
      },
      // {
      //   fileName: 'Shipping Order',
      //   isActive : (entity: Booking) => {
      //     return entity.moduleTypeCode === 'AIR' || entity.moduleTypeCode === 'SEA'
      //   },
      //   allowFillTemplate: false,
      // },
      // {
      //   isActive : true,
      //   fileName: 'Shipping Advice',
      //   allowFillTemplate: false
      // },
      // {
      //   isActive : true,
      //   fileName: 'Print Invoice',
      //   allowFillTemplate: false
      // },
      // {
      //   isActive : false,
      //   fileName: 'Pro Forma Invoice',
      //   allowFillTemplate: false
      // },
      // {
      //   isActive : true,
      //   fileName: 'Packing List',
      //   allowFillTemplate: false
      // },
      // {
      //
      //   isActive : true,
      //   fileName: 'Load Plan',
      //   allowFillTemplate: false
      // },
      // {
      //
      //   isActive : true,
      //   fileName: 'Shipping Instructions',
      //
      //   allowFillTemplate: false
      // },
      // {
      //   isActive : true,
      //   fileName: 'House Bill',
      //   allowFillTemplate: false
      // }
    ]
  } as EntityConfig,

  {
    tableName: 'shipment',
    defaultDocumentConfig: {
      isActive : true,
      allowFileType: [
        'image/png',
        'image/gif',
        'image/jpeg',
        'application/zip',
        'application/pdf',
        'application/msword',
        'application/vnd.ms-excel',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/vnd.oasis.opendocument.presentation',
        'application/vnd.oasis.opendocument.spreadsheet',
        'application/vnd.oasis.opendocument.text',
        'text/csv',
        'url',
        'application/octet-stream'
      ],
      allowFillTemplate: false
    },
    documentList: [
      {
        fileName: 'Freight Invoice',
        isActive : true,
        allowFillTemplate: false
      },
      {
        fileName: 'MBL',
        isActive : true,
        allowFillTemplate: false
      },
      {
        fileName: 'HBL Original',
        isActive : true,
        allowFillTemplate: false
      },
      {
        fileName: 'HBL Telex released',
        isActive : true,
        allowFillTemplate: false
      },
      {
        fileName: 'Commercial Invoice',
        isActive : true,
        allowFillTemplate: false
      },
      {
        fileName: 'Packing List',
        isActive : true,
        allowFillTemplate: false
      },
      // {
      //   fileName: 'FCL Document',
      //   isActive : false,
      //   allowFillTemplate: false
      // },
      // {
      //   fileName: 'LCL Document',
      //   isActive : false,
      //   allowFillTemplate: false
      // },
    ]
  } as EntityConfig

] as EntityConfig[]
