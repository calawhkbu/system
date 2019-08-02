
// import { EventService, EventConfig } from 'modules/events/service'

import { EventService, EventConfig } from '../../../swivel-backend-new/src/modules/events/service'


export default {
  afterCreate_i18n: [
    {
      handlerName: "example.ts",
      otherParameters: {},
      afterEvent: []
    }
  ],



  example: [

    {
      handlerName: "example.ts",
      otherParameters: {},
      afterEvent: [

        {
          eventName: "example2",
          previousParameters: {}
        }
      ]
    }
  ],


  example2: [

  ],


 // should not be called directly, should be called after an event
  create_alert: [

    {
      handlerName: "create_alert.ts"
    }
  ],



  create_tracking : [

    {
      handlerName: "create_tracking.ts"
    }

  ],



  // update entity(booking) with a tracking
  tracking_update_data : [

    {
      handlerName: "tracking_update_data.ts"
    }

  ],


  afterCreate_tracking : [

    {
      eventName: "tracking_update_data"
    },

  ],

  afterUpdate_tracking : [

    {
      eventName: "tracking_update_data"
    }

  ],


  // should not be called directly, should be called after an event
  fill_template: [

    {
      handlerName: "fill_template.ts"
      
    }
  ],

  update_document_preview : [
    
    {
      handlerName: "update_document_preview.ts"
    }

  ],

  afterCreate_document : [

    {
      eventName: "update_document_preview"
    }

  ],

  afterUpdate_document : [

    {
      eventName: "update_document_preview.ts"
    }

  ],


  afterCreate_booking: [

    // create alert of new Booking
    {
      condition : true,
      eventName : 'create_alert',
      otherParameters : {
        alertType : 'newBooking',
        tableName : 'booking',
        primaryKey : (parameters) => {

          // use booking.id as primaryKey
          return parameters.data.id
        }
      
      }
    },


    // update personId / create Invitation 
    {
      condition : true,
      handlerName : 'entity_create_invitation.ts',
      otherParameters : {
        tableName : 'booking',      
      }
    },

    // create booking tracking
    {
      condition : true,
      eventName : 'create_tracking',
    },


    // fill template of the booking
    {
      condition : true,
      eventName : 'fill_template',
      otherParameters : {

        tableName : 'booking',
        fileName : 'Shipping Order',

        // use booking .id as primaryKey
        primaryKey : (result) => {
          return result.data.id
        }
      }
    },

  ],

  afterCreate_booking2: [

    {

      condition : true,
      handlerName: "checker.ts",
      otherParameters: {

        checker: {

          id: [

            {

              // warning: checkFunctionName should be unqiue so that the next event can extract back the result based on the name
              checkerFunctionName: "isEqual",
              checkerParam: {
                value: 689
              }
            },

            {
              checkerFunctionName: "isEmpty",
            },

            {
              checkerFunctionName: "isNull",
            }
          ],


          bookingNo: [

            {

              checkerFunctionName: "mytest",
              checkerFunction: (parameters, checkerParam) => {

                const bookingNo = parameters.data.bookingNo as string

                return bookingNo.startsWith(checkerParam["value"])

              },
              checkerParam: {
                value: "777"
              }
            },

          ]
        }

      },
      afterEvent: [

        {

          eventName: "fill_template",

          previousParameters: {
            fileName : 'Shipping Order',

            primaryKey : (parameters) => {
              return parameters['data']['id']
            },
            tableName : 'booking'
          },

          condition : false
        }






      ]
    }


  ],





} as {
  [eventName: string]: EventConfig[]

}
