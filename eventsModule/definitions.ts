import { EventConfig } from 'modules/events/service'
import { diff } from 'modules/events/checkerFunction'

export default {
  // should not be called directly, should be called after an event
  create_alert: [// create alert from entity
    {
      handlerName: 'create_alert',
    },
  ],
  create_tracking_by_booking: [// create tracking from entity
    {
      handlerName: 'create_tracking_by_booking',
    },
  ],
  tracking_update_data: [// update entity(booking) with a tracking
    {
      handlerName: 'tracking_update_data',
    },
  ],
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
  fm3k_booking: [
    {
      condition: true,
      handlerName: 'fm3k_booking',
    },
  ],
  send_edi: [
    {
      handlerName: 'send_edi'
    }
  ],
  afterCreate_tracking: [
    {
      eventName: 'tracking_update_data',
    },
    {
      eventName: 'send_edi',
    },
  ],
  afterUpdate_tracking: [
    {
      eventName: 'tracking_update_data',
    },
    {
      eventName: 'send_edi',
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
    {
      condition: true,
      eventName: 'create_alert',
      otherParameters: {
        alertType: 'newBooking',
        tableName: 'booking',
        primaryKey: (parameters: any) => {
          // use booking.id as primaryKey
          return parameters.data.id
        },
      },
    },

    // create booking tracking
    {
      condition: true,
      eventName: 'create_tracking_by_booking',
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
      eventName: 'create_tracking_by_booking',
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
              const difference = diff(
                parameters.oldData,
                parameters.data,
                undefined,
                ['documents'],
                ['createdAt', 'createdBy', 'updatedAt', 'updatedBy']
              )

              // console.log('difference')
              // console.log(difference)

              return difference ? true : false
            },
          },
        ],
      },
      afterEvent: [
        // warning: not using !!!!!!!
        // // update personId / create Invitation
        // {
        //   condition : true,
        //   handlerName : 'entity_create_invitation',
        //   previousParameters : {
        //     tableName : 'booking'
        //   }
        // },
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
    },
  ],
} as {
  [eventName: string]: EventConfig[]
}
