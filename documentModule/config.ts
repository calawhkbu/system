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
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/pdf',
        'url',
        'application/octet-stream'
      ],
      allowFillTemplate: false
    },

    documentList: [
      {
        fileName: 'Shipping Order',

        isActive : (entity: Booking) => {
          return entity.moduleTypeCode === 'AIR' || entity.moduleTypeCode === 'SEA'
        },

        // get the template by templateName and fill it
        allowFillTemplate: true,
        templateName: (entity: Booking) => {
          return 'shippingOrder'
        },
      },

      {
        isActive : true,
        fileName: 'Shipping Advice',
        allowFillTemplate: false
      },
      {
        isActive : true,
        fileName: 'Print Invoice',
        allowFillTemplate: false
      },
      {
        isActive : false,
        fileName: 'Pro Forma Invoice',
        allowFillTemplate: false
      },
      {

        isActive : true,
        fileName: 'Packing List',
        allowFillTemplate: false
      },
      {

        isActive : true,
        fileName: 'Load Plan',
        allowFillTemplate: false
      },
      {

        isActive : true,
        fileName: 'Shipping Instructions',

        allowFillTemplate: false
      },
      {
        isActive : true,
        fileName: 'House Bill',
        allowFillTemplate: false
      }
    ]
  } as EntityConfig,

  {
    tableName: 'shipment',

    defaultDocumentConfig: {

      isActive : true,
      allowFileType: [
        'image/png',
        'image/gif',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/pdf'
      ],
      allowFillTemplate: false
    },

    documentList: [
      {
        fileName: 'Freight Invoice',
        allowFileType: [
          'image/png',
          'image/gif',
          'image/jpeg',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/pdf'
        ],

        isActive : (entity: Shipment) => {
          return true
          // return entity.moduleTypeCode === 'SEA'
        },
        allowFillTemplate: false
      },

      {
        fileName: 'MBL',
        allowFileType: [
          'image/png',
          'image/gif',
          'image/jpeg',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/pdf'
        ],

        isActive : true,
        allowFillTemplate: false
      },

      {
        fileName: 'HBL Original',
        allowFileType: [
          'image/png',
          'image/gif',
          'image/jpeg',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/pdf'
        ],
    
        isActive : true,
        allowFillTemplate: false
      },
    
      {
        fileName: 'HBL Telex released',
        allowFileType: [
          'image/png',
          'image/gif',
          'image/jpeg',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/pdf'
        ],
    
        isActive : true,
        allowFillTemplate: false
      },
    
    
      {
        fileName: 'Commercial Invoice',
        allowFileType: [
          'image/png',
          'image/gif',
          'image/jpeg',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/pdf'
        ],
    
        isActive : true,
        allowFillTemplate: false
      },
    
    
      {
        fileName: 'Packing List',
        allowFileType: [
          'image/png',
          'image/gif',
          'image/jpeg',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/pdf'
        ],
    
        isActive : true,
        allowFillTemplate: false
      },

      {
        fileName: 'FCL Document',
        allowFileType: [
          'image/png',
          'image/gif',
          'image/jpeg',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/pdf'
        ],

        isActive : (entity: Shipment) => {
          return false
          // return entity.serviceCode && entity.serviceCode === 'FCL/FCL'
        },
        allowFillTemplate: false
      },
      {
        fileName: 'LCL Document',
        allowFileType: [
          'image/png',
          'image/gif',
          'image/jpeg',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/pdf'
        ],

        isActive : (entity: Shipment) => {
          return false
          //return entity.serviceCode && entity.serviceCode.startsWith('LCL/LC')
        },
        allowFillTemplate: false
      },

    ]
  } as EntityConfig

] as EntityConfig[]
