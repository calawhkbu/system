import { EventConfig, EventData, EventHandlerConfig } from 'modules/events/service'
import { diff } from 'modules/events/checkerFunction'
import { Booking } from 'models/main/booking'

export default {
  // BASE EVENT
  test: [{ handlerName: 'test' }], // create alert from entity
  create_related_party: [{ handlerName: 'create_related_party' }], // create related party record
  // create related person
  create_tracking: [{ handlerName: 'create_tracking' }], // create tracking from entity
  send_data_to_external: [{ handlerName: 'send_data_to_external' }], // send data to external system
  // send edi
  update_document_preview: [{ handlerName: 'update_document_preview' }],
  update_data_from_tracking: [{ handlerName: 'update_data_from_tracking' }], // update tracking id to entity
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

      condition : true,
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

    } as EventHandlerConfig,

    {
      eventName : 'test',
      condition : true

    } as EventConfig

  ],
  // booking
  afterCreate_booking: [
    // send notify
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
    // send fm3k
    {
      condition: ({ originalEntity }: EventData<any>) => {
        if (process.env.NODE_ENV === 'production') {
          return originalEntity.from !== 'erp'
        }
        return false
      },
      eventName: 'send_data_to_external',
      otherParameters: {
        outboundName: 'erp-booking'
      }
    },
    // fill shipping order
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
  ],
  afterUpdate_booking: [
    // send notify
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
    // send fm3k
    {
      condition: ({ originalEntity }: EventData<any>) => {
        if (process.env.NODE_ENV === 'production') {
          return originalEntity.from !== 'erp'
        }
        return false
      },
      eventName: 'send_data_to_external',
      otherParameters: {
        outboundName: 'erp-booking'
      }
    },
    // fill shipping order
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
  ],
  // documents
  afterCreate_document: [
    // update perview
    { eventName: 'update_document_preview' },
  ],
  afterUpdate_document: [
    // update perview
    { eventName: 'update_document_preview' },
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
          masterNo: ({ masterNo }: any) => {
            return masterNo
          },
          soNo: ({ shipmentContainers = [] }: any) => {
            console.log(shipmentContainers, 'here')
            return shipmentContainers.reduce((nos: string[], { carrierBookingNo }: any) => {
              if (carrierBookingNo) {
                nos.push(carrierBookingNo)
              }
              return nos
            }, [])
          },
          containerNo: ({ shipmentContainers = [] }: any) => {
            console.log(shipmentContainers, 'here')
            return shipmentContainers.reduce((nos: string[], { containerNo }: any) => {
              if (containerNo) {
                nos.push(containerNo)
              }
              return nos
            }, [])
          }
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
          masterNo: ({ masterNo }: any) => {
            return masterNo
          },
          soNo: ({ shipmentContainers = [] }: any) => {
            console.log(shipmentContainers, 'here')
            return shipmentContainers.reduce((nos: string[], { carrierBookingNo }: any) => {
              if (carrierBookingNo) {
                nos.push(carrierBookingNo)
              }
              return nos
            }, [])
          },
          containerNo: ({ shipmentContainers = [] }: any) => {
            console.log(shipmentContainers, 'here')
            return shipmentContainers.reduce((nos: string[], { containerNo }: any) => {
              if (containerNo) {
                nos.push(containerNo)
              }
              return nos
            }, [])
          }
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
  ],
  afterCreate_tracking: [
    // update data to entity
    {
      eventName: 'update_data_from_tracking',
    },
    // create alert
  ],
  afterUpdate_tracking: [
    // update data to entity
    {
      eventName: 'update_data_from_tracking',
    },
    // create alert
  ]
} as {
  [eventName: string]: (EventConfig | EventHandlerConfig)[]
}
