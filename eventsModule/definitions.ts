
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


  // should not be called directly, should be called after an event
  fill_template: [

    {
      handlerName: "fill_template.ts"
    }
  ],


  afterCreate_booking: [
    {

      condition: true,
      handlerName: "checker.ts",
      otherParameters: {

        checker: {
          "data.id": [
            {
              // warning: checkFunctionName should be unqiue so that the next event can extract back the result based on the name
              checkerFunctionName: "isMatch",
              checkerParam: {
                operator : "=",
                value: 689
              }
            },

            {
              checkerFunctionName: "isNull",

            },

            {
              checkerFunctionName: "isEmpty",
            }
          ],


          "data.bookingNo": [
            {
              checkerFunctionName: "mytest",
              checkerFunction: (variable, checkerParam) => {

                const bookingNo = variable as string
                return bookingNo.startsWith(checkerParam["value"])

              },
              checkerParam: {
                value: "777"
              }
            },
          ]
        }

      },

      afterEvent : [
        // {
        //   condition : true,
        //   eventName : 'fill_template',
        //   previousParameters : {

        //     tableName : 'booking',
        //     fileName : 'Shipping Order',
        //     primaryKey : (parameters) => {
        //       return parameters.data.id
        //     }
        //   }
        // },
        {
          condition : (result) => {

            // return result["checkerResult"]["data.id"] as boolean

            return true
          },

          eventName : 'create_alert',
          previousParameters : {
            alertType : 'lateShip',
            tableName : 'booking',
            primaryKey : (parameters) => {
              return parameters.data.id
            }
          
          }
        },


 
      ]
    }


  ],

  // afterCreate_booking2: [

  //   {

  //     "condition" : true,
  //     "handlerName": "checker.ts",
  //     "otherParameters": {

  //       "checker": {

  //         "id": [

  //           {

  //             // warning: checkFunctionName should be unqiue so that the next event can extract back the result based on the name
  //             "checkerFunctionName": "isEqual",
  //             "checkerParam": {
  //               "value": 689
  //             }
  //           },

  //           {
  //             "checkerFunctionName": "isEmpty",
  //           },

  //           {
  //             "checkerFunctionName": "isNull",
  //           }
  //         ],


  //         "bookingNo": [

  //           {

  //             "checkerFunctionName": "mytest",
  //             "checkerFunction": (parameters, checkerParam) => {

  //               const bookingNo = parameters.data.bookingNo as string

  //               return bookingNo.startsWith(checkerParam["value"])

  //             },
  //             "checkerParam": {
  //               "value": "777"
  //             }
  //           },

  //         ]
  //       }

  //     },
  //     "afterEvent": [

  //       {

  //         "handlerName": "fill_template.ts",

  //         "otherParameters": {
  //           "fileName" : 'Shipping Order',
  //           'primaryKey' : (parameters) => {

  //             return parameters['data']['id']

  //           },
  //           "tableName" : 'booking'

  //         },

  //         "condition" : false,
  //         "afterEvent": []
  //       }






  //     ]
  //   }


  // ],





  afterCreate_alert: [


  ]

} as {
  [eventName: string]: EventConfig[]

}
