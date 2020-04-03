import { EventConfig, EventData, EventHandlerConfig } from 'modules/events/service'
import { diff } from 'modules/events/checkerFunction'
import { Booking } from 'models/main/booking'

export default {

  test: [{ handlerName: 'test' }], // create alert from entity

  // should not be called directly, should be called after an event
  create_alert: [{ handlerName: 'create_alert' }], // create alert from entity
  create_tracking: [{ handlerName: 'create_tracking' }], // create tracking from entity
  fill_template: [{ handlerName: 'fill_template' }],
  send_data_to_external: [{ handlerName: 'send_data_to_external' }],
  send_edi: [{ handlerName: 'send_edi' }],
  create_related_party: [{handlerName: 'create_related_party'}],
  create_related_person: [{handlerName: 'create_related_person'}],

  update_or_create_related_person: [{handlerName: 'update_or_create_related_person'}],

  invitation_create_related_person : [{ handlerName : 'invitation_create_related_person' }],
  // start here

  // test

  testAll : [
    // {
    //   condition : true,
    //   eventName : 'test',
    //   otherParameters : {

    //     alertType : 'booking',
    //     tableName: 'booking',
    //     primaryKey : (eventData: EventData<Booking>) => {
    //       return eventData.latestEntity.id
    //     }
    //   }
    // },

    {

      condition : false,
      handlerName : 'checker',
      otherParameters : {

        checker: [
          {
            resultName: 'haveDiff',
            checkerFunction: (eventData: EventData<Booking>) => {
              const difference = diff(
                eventData.originalEntity,
                eventData.latestEntity,
                undefined,
                ['documents'],
                ['createdAt', 'createdBy', 'updatedAt', 'updatedBy']
              )
              return difference ? true : false
            },
          },
        ],
      },
      afterEvent : [

        {
          eventName : 'test',
          condition : (eventData: EventData<any>) => {
            return eventData.checkerResult.haveDiff as boolean
          }
        }
      ]

    } as EventHandlerConfig

  ],

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
    // create tracking
    {
      condition: true,
      eventName: 'create_tracking',
      otherParameters: {
        tableName: 'booking',
        loadashMapping: {
          isTracking: 'tracking',
          moduleTypeCode: 'moduleTypeCode',
          carrierCode: 'carrierCode',
          departureDateEstimated: 'bookingDate.departureDateEstimated',
          masterNo: ({ moduleTypeCode, bookingReference = [] }: any) => {
            return bookingReference.reduce((masterNo: string, { refName, refDescription }: any) => {
              if (!masterNo && (refName === (moduleTypeCode === 'SEA' ? 'MBL' : 'MAWB'))) {
                masterNo = refDescription
              }
              return masterNo
            }, null)
          },
          soNo: ({ bookingContainers = []}: any) => {
            return bookingContainers.reduce((nos: string[], { soNo }: any) => {
              if (soNo) {
                nos.push(soNo)
              }
              return soNo
            }, [])
          },
          containerNo: ({ bookingContainers = []}: any) => {
            return bookingContainers.reduce((nos: string[], { containerNo }: any) => {
              if (containerNo) {
                nos.push(containerNo)
              }
              return containerNo
            }, [])
          },
        }
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
    // create related party
    {
      condition: true,
      eventName: 'create_related_party',
      otherParameters: {
        partyLodash: 'bookingParty',
        fixedParty: ['shipper', 'consignee', 'forwarder', 'agent', 'notifyParty']
      }
    },
    // create related person
    {
      condition: true,
      eventName: 'update_or_create_related_person',
      otherParameters: {
        partyLodash: 'bookingParty',
        fixedParty: ['shipper', 'consignee', 'forwarder', 'agent', 'notifyParty']
      }
    },
    // send fm3k
    {
      condition: true,
      eventName: 'send_data_to_external',
      otherParameters: {
        outboundName: 'fm3k-booking'
      }
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
        tableName: 'booking',
        loadashMapping: {
          isTracking: 'tracking',
          moduleTypeCode: 'moduleTypeCode',
          carrierCode: 'carrierCode',
          departureDateEstimated: 'bookingDate.departureDateEstimated',
          masterNo: ({ moduleTypeCode, bookingReference = [] }: any) => {
            return bookingReference.reduce((masterNo: string, { refName, refDescription }: any) => {
              if (!masterNo && (refName === (moduleTypeCode === 'SEA' ? 'MBL' : 'MAWB'))) {
                masterNo = refDescription
              }
              return masterNo
            }, null)
          },
          soNo: ({ bookingContainers = []}: any) => {
            return bookingContainers.reduce((nos: string[], { soNo }: any) => {
              if (soNo) {
                nos.push(soNo)
              }
              return soNo
            }, [])
          },
          containerNo: ({ bookingContainers = []}: any) => {
            return bookingContainers.reduce((nos: string[], { containerNo }: any) => {
              if (containerNo) {
                nos.push(containerNo)
              }
              return containerNo
            }, [])
          },
        }
      }
    },
    // create related party
    {
      condition: true,
      eventName: 'create_related_party',
      otherParameters: {
        partyLodash: 'bookingParty',
        fixedParty: ['shipper', 'consignee', 'forwarder', 'agent', 'notifyParty']
      }
    },
    // update or create related person
    {
      condition: true,
      eventName: 'update_or_create_related_person',
      otherParameters: {
        partyLodash: 'bookingParty',
        fixedParty: ['shipper', 'consignee', 'forwarder', 'agent', 'notifyParty']
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
      eventName: 'send_data_to_external',
      otherParameters: {
        outboundName: 'fm3k-booking'
      }
    },
  ],
  // documents
  update_document_preview: [{ handlerName: 'update_document_preview' }],
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
  afterCreate_shipment: [
    // create tracking
    {
      condition: true,
      eventName: 'create_tracking',
      otherParameters: {
        tableName: 'shipment',
        loadashMapping: {
          isTracking: 'tracking',
          moduleTypeCode: 'moduleTypeCode',
          carrierCode: 'carrierCode',
          departureDateEstimated: 'shipmentDate.departureDateEstimated',
          masterNo: 'trackingNos.masterNo',
          soNo: 'trackingNos.soNo',
          containerNo: 'trackingNos.containerNo'
        }
      }
    },
    // create related party
    {
      condition: true,
      eventName: 'create_related_party',
      otherParameters: {
        partyLodash: 'shipmentParty',
        fixedParty: ['shipper', 'consignee', 'office', 'agent', 'roAgent', 'linerAgent', 'controllingCustomer']
      }
    },
    // create related person
    {
      condition: true,
      eventName: 'create_related_person',
      otherParameters: {
        partyLodash: 'shipmentParty',
        fixedParty: ['shipper', 'consignee', 'office', 'agent', 'roAgent', 'linerAgent', 'controllingCustomer']
      }
    },
  ],
  afterUpdate_shipment: [
    // create tracking
    {
      condition: true,
      eventName: 'create_tracking',
      otherParameters: {
        tableName: 'shipment',
        loadashMapping: {
          isTracking: 'tracking',
          moduleTypeCode: 'moduleTypeCode',
          carrierCode: 'carrierCode',
          departureDateEstimated: 'shipmentDate.departureDateEstimated',
          masterNo: 'trackingNos.masterNo',
          soNo: 'trackingNos.soNo',
          containerNo: 'trackingNos.containerNo'
        }
      }
    },
    // create related party
    {
      condition: true,
      eventName: 'create_related_party',
      otherParameters: {
        partyLodash: 'shipmentParty',
        fixedParty: ['shipper', 'consignee', 'office', 'agent', 'roAgent', 'linerAgent', 'controllingCustomer']
      }
    },
    // create related person
    {
      condition: true,
      eventName: 'create_related_person',
      otherParameters: {
        partyLodash: 'shipmentParty',
        fixedParty: ['shipper', 'consignee', 'office', 'agent', 'roAgent', 'linerAgent', 'controllingCustomer']
      }
    },
  ],
  // tracking
  create_tracking_alerts: [
    {// update entity(booking) with a tracking
      handlerName: 'create_tracking_alerts'
    }
  ],
  tracking_error_update_reference_again: [
    { // update error ro change
      handlerName: 'tracking_error_update_reference_again',
      otherParameters: {
        maxErrorTime: 12
      }
    }
  ],
  update_tracking_back_to_entity: [
    {// update tracking id to entity
      handlerName: 'update_tracking_back_to_entity'
    }
  ],
  update_shipment_date_from_tracking: [
    {// update tracking id to entity
      handlerName: 'update_shipment_date_from_tracking'
    }
  ],
  afterCreate_tracking: [
    // {
    //   eventName: 'create_tracking_alerts',
    // },
    {
      eventName: 'tracking_error_update_reference_again',
    },
    // {
    //   eventName: 'update_tracking_back_to_entity'
    // },
    {
      eventName: 'update_shipment_date_from_tracking',
    },
  ],
  afterUpdate_tracking: [
    // {
    //   eventName: 'create_tracking_alerts',
    // },
    {
      eventName: 'tracking_error_update_reference_again',
    },
    // {
    //   eventName: 'update_tracking_back_to_entity'
    // },
    {
      eventName: 'update_shipment_date_from_tracking',
    },
    // {
    //   eventName: 'send_edi',
    // },
  ],

  afterCreate_invitation : [
    {
      eventName: 'invitation_create_related_person'
    }
  ]

} as {
  [eventName: string]: (EventConfig | EventHandlerConfig)[]
}
