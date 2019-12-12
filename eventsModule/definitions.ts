import { EventConfig } from 'modules/events/service'
import { diff } from 'modules/events/checkerFunction'

export default {
  // should not be called directly, should be called after an event
  create_alert: [{ handlerName: 'create_alert' }], // create alert from entity
  create_tracking: [{ handlerName: 'create_tracking' }], // create tracking from entity
  create_tracking_alerts: [{ handlerName: 'create_tracking_alerts' }], // update entity(booking) with a tracking
  fill_template: [{ handlerName: 'fill_template' }],
  update_document_preview: [{ handlerName: 'update_document_preview' }],
  fm3k_booking: [{ handlerName: 'fm3k_booking' }],
  send_edi: [{ handlerName: 'send_edi' }],
  // start here
  // booking
  afterCreate_booking: [
    // create new booking alert and should move to workflow later
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
      eventName: 'create_tracking',
      otherParameters: {
        tableName: 'booking'
      }
    },
    // fill shipping order
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
    // send fm3k
    {
      condition: true,
      eventName: 'fm3k_booking'
    },
  ],
  afterUpdate_booking: [
    // create new booking alert and should move to workflow later
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
      eventName: 'create_tracking',
      otherParameters: {
        tableName: 'booking'
      }
    },
    // fill shipping order
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
              return difference ? true : false
            },
          },
        ],
      },
      afterEvent: [
        // warning: not using !!!!!!! auto invitation is now abandoned
        // update personId / create Invitation
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
    // send fm3k
    {
      condition: true,
      eventName: 'fm3k_booking'
    },
  ],
  // documents
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
  // purchase-order
  // shipment
  // tracking
  afterCreate_tracking: [
    {
      eventName: 'create_tracking_alerts',
    },
  ],
  afterUpdate_tracking: [
    {
      eventName: 'create_tracking_alerts',
    },
    {
      eventName: 'send_edi',
    },
  ],


} as {
  [eventName: string]: EventConfig[]
}
