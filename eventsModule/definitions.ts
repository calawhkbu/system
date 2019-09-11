import { EventService, EventConfig } from 'modules/events/service'
import { extractObject, diff } from 'modules/events/checkerFunction'

export default {
  afterCreate_i18n: [
    {
      handlerName: 'example',
      otherParameters: {},
      afterEvent: [],
    },
  ],

  example: [
    {
      handlerName: 'example',
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
      handlerName: 'create_alert',
    },
  ],

  create_tracking: [
    {
      handlerName: 'create_tracking',
    },
  ],

  // update entity(booking) with a tracking
  tracking_update_data: [
    {
      handlerName: 'tracking_update_data',
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
      handlerName: 'fill_template',
    },
  ],

  update_document_preview: [
    {
      handlerName: 'update_document_preview',
    },
  ],

  afterCreate_document: [
    {
      eventName: 'update_document_preview',
    },
  ],

  afterUpdate_document: [
    {
      eventName: 'update_document_preview',
    },
  ],

  afterCreate_booking: [
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
    //   handlerName : 'entity_create_invitation',
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
      eventName: 'create_tracking',
    },
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
    {
      condition: true,
      handlerName: 'checker',
      otherParameters: {
        checker: [
          {
            resultName: 'haveDiff',
            checkerFunction: (parameters: any) => {

              const difference = diff(parameters.oldData, parameters.data, undefined, undefined, ['createdAt', 'createdBy', 'updatedAt', 'updatedBy'])

              console.log('difference')
              console.log(difference)

              return (difference) ? true : false

            }
          },

        ],
      },
      afterEvent: [
        {
          eventName: 'fill_template',
          previousParameters: {
            tableName: 'booking',
            fileName: 'Shipping Order',
            primaryKey: parameters => {
              return parameters.data.id
            },
          },
          condition(parameters: any) {
            return parameters.checkerResult['haveDiff']
          },
        },
      ],
    }

  ],

  fm3k_booking : [
    {
      condition : true,
      handlerName : 'fm3k_booking'
    }

  ]

} as {
  [eventName: string]: EventConfig[]
}
