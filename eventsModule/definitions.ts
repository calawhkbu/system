import { EventService, EventConfig } from 'modules/events/service'

export default {
  afterCreate_i18n: [
    {
      handlerName: 'example.ts',
      otherParameters: {},
      afterEvent: [],
    },
  ],

  example: [
    {
      handlerName: 'example.ts',
      otherParameters: {},
      afterEvent: [
        {
          eventName: 'example2',
          previousParameters: {},
        },
      ],
    },
  ],

  example2: [],

  // should not be called directly, should be called after an event
  create_alert: [
    {
      handlerName: 'create_alert.ts',
    },
  ],

  create_tracking: [
    {
      handlerName: 'create_tracking.ts',
    },
  ],

  // update entity(booking) with a tracking
  tracking_update_data: [
    {
      handlerName: 'tracking_update_data.ts',
    },
  ],

  afterCreate_tracking: [
    {
      eventName: 'tracking_update_data',
    },
  ],

  afterUpdate_tracking: [
    {
      eventName: 'tracking_update_data',
    },
  ],

  // should not be called directly, should be called after an event
  fill_template: [
    {
      handlerName: 'fill_template.ts',
    },
  ],

  update_document_preview: [
    {
      handlerName: 'update_document_preview.ts',
    },
  ],

  afterCreate_document: [
    {
      eventName: 'update_document_preview',
    },
  ],

  afterUpdate_document: [
    {
      eventName: 'update_document_preview.ts',
    },
  ],

  afterUpdate_booking2: [
    {
      condition: true,
      eventName: 'create_tracking',
    },
    // {
    //   condition : true,
    //   handlerName : 'entity_create_invitation.ts',
    //   otherParameters : {
    //     tableName : 'booking',
    //   }
    // }
  ],

  afterCreate_booking2: [
    // create alert of new Booking
    {
      condition: true,
      eventName: 'create_alert',
      otherParameters: {
        alertType: 'newBooking',
        tableName: 'booking',
        primaryKey: parameters => {
          // use booking.id as primaryKey
          return parameters.data.id
        },
      },
    },

    // // update personId / create Invitation
    // {
    //   condition : true,
    //   handlerName : 'entity_create_invitation.ts',
    //   otherParameters : {
    //     tableName : 'booking',
    //   }
    // },

    // // create booking tracking
    {
      condition: true,
      eventName: 'create_tracking',
    },

    // fill template of the booking
    {
      condition: true,
      eventName: 'fill_template',
      otherParameters: {
        tableName: 'booking',
        fileName: 'Shipping Order',

        // use booking .id as primaryKey
        primaryKey: result => {
          return result.data.id
        },
      },
    },
  ],

  afterUpdate_booking: [

    {
      condition: true,
      handlerName: 'checker.ts',
      otherParameters: {
        checker: [
          {
            resultName: 'bookingNo_isDiff',
            checkerFunction: (parameters: any, functionMap: Map<string, Function>) => {
              return functionMap.get('diff')(parameters.oldData, parameters.data,
                [
                  'bookingNo',
                  'moduleTypeCode',
                  'boundTypeCode',
                  'serviceCode'
                ]

              )

            }
          },

        ],
      },
      afterEvent: [
        {
          eventName: 'example',
          previousParameters: {},

          condition(parameters: any) {
            console.log('condition in afterEvent')

            return true
          },
        },
      ],
    }

  ],

  afterCreate_booking: [],
} as {
  [eventName: string]: EventConfig[]
}
