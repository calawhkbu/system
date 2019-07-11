export default {
  afterCreate_i18n: [
    {
      "handlerName": "example.ts",
      "otherParameters": {},
      "afterEvent": []
    }
  ],


  afterCreate_shipment: [
    {
      "condition": (param) => {
      },
      "handlerName": "compare.ts",
      "otherParameters": {

        "id": [
          {
            "functionName": "isEmpty",
          },

          {
            "functionName": "isNull",
          }
        ],


        "etd": {

          "functionName": "gte",
          "value": 7

        }

      },
      "afterEvent": [


        {

          

          "handlerName": "exampe1.ts",
          "otherParameters": {},
          "afterEvent": []
        },


        {
          "handlerName": "example2.ts",
          "otherParameters": {},
          "afterEvent": []
        }



      ]
    },
    {
      "handlerName": "sendEmail.ts"
    }
  ],



  // afterCreate_booking: [

  //   {
  //     handlerName: "fill_template.ts",
  //     otherParameters: {
  //       tableName: 'booking',
  //       fileName: '',
  //       outputFileType: 'excel'
  //     },

  //   }
    
  // ],


  afterCreate_alert: [


  ]

}
