import { EventConfig, EventData, EventHandlerConfig } from 'modules/events/service'
import { Booking } from 'models/main/booking'
import { Shipment } from 'models/main/shipment'

export default {
  // BASE EVENT
  create_related_party: [{ handlerName: 'create_related_party' }], // create related party record
  create_related_person: [{ handlerName: 'create_related_person' }], // create related party record
  create_tracking: [{ handlerName: 'create_tracking' }], // create tracking from entity
  notify_entity: [{ handlerName: 'notify_entity'}],
  resend_alert: [{ handlerName: 'resend_alert' }], // resend alert
  send_data_to_external: [{ handlerName: 'send_data_to_external' }], // send data to external system
  update_data_from_tracking: [{ handlerName: 'update_data_from_tracking' }], // update tracking id to entity
  update_document_preview: [{ handlerName: 'update_document_preview' }], // update document preview
  // start here
  // booking
  afterCreate_booking: [
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
          soNo: ({ bookingContainers = [] }: any) => {
            return bookingContainers.reduce((nos: string[], { soNo }: any) => {
              if (soNo) {
                nos.push(soNo)
              }
              return nos
            }, [])
          },
          containerNo: ({ bookingContainers = [] }: any) => {
            return bookingContainers.reduce((nos: string[], { containerNo }: any) => {
              if (containerNo) {
                nos.push(containerNo)
              }
              return nos
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
    // create related party
    {
      condition: true,
      eventName: 'create_related_party',
      otherParameters: {
        primaryKey: (eventData: EventData<Booking>) => {
          return eventData.latestEntity.id
        },
        tableName: 'booking'
      }
    },
    // create related person
    {
      handlerName: 'create_related_person',
      otherParameters: {
        partyGroupCode: (eventData: EventData<Booking>) => {
          return eventData.latestEntity.partyGroupCode
        },
        primaryKey: (eventData: EventData<Booking>) => {
          return eventData.latestEntity.id
        },
        tableName: 'booking',
        selectedPartyGroup: ['DEV', 'STD']
      },
      afterEvent: [
        {// resend alert
          condition: true,
          eventName: 'resend_alert',
          otherParameters: {

            partyGroupCode: (eventData: EventData<Shipment>) => {
              return eventData.latestEntity.partyGroupCode
            },

            tableName: 'booking',

            primaryKey: (eventData: EventData<Shipment>) => {
              return eventData.latestEntity.id
            }
          }
        }, {// notify entity
          condition: true,
          eventName: 'notify_entity',
          otherParameters: {
            partyGroupCode: (eventData: EventData<Booking>) => {
              return eventData.latestEntity.partyGroupCode
            },
            primaryKey: (eventData: EventData<Booking>) => {
              return eventData.latestEntity.id
            },
            tableName: 'booking',
            notifyKeys: {
              DEV: ['createdBy', 'forwarder'],
              STD: ['createdBy', 'forwarder']
            }
          },
        }
      ]
    },

    // fill shipping order
  ],
  afterUpdate_booking: [
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
          soNo: ({ bookingContainers = [] }: any) => {
            return bookingContainers.reduce((nos: string[], { soNo }: any) => {
              if (soNo) {
                nos.push(soNo)
              }
              return nos
            }, [])
          },
          containerNo: ({ bookingContainers = [] }: any) => {
            return bookingContainers.reduce((nos: string[], { containerNo }: any) => {
              if (containerNo) {
                nos.push(containerNo)
              }
              return nos
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
    // create related party
    {
      condition: true,
      eventName: 'create_related_party',
      otherParameters: {
        primaryKey: (eventData: EventData<Booking>) => {
          return eventData.latestEntity.id
        },
        tableName: 'booking'
      }
    },
    // create related person
    {
      eventName: 'create_related_person',
      otherParameters: {
        partyGroupCode: (eventData: EventData<Shipment>) => {
          return eventData.latestEntity.partyGroupCode
        },
        primaryKey: (eventData: EventData<Shipment>) => {
          return eventData.latestEntity.id
        },
        tableName: 'booking',
        selectedPartyGroup: ['DEV', 'STD']
      },
      afterEvent: [
        {// resend alert
          condition: true,
          eventName: 'resend_alert',
          otherParameters: {
            partyGroupCode: (eventData: EventData<Shipment>) => {
              return eventData.latestEntity.partyGroupCode
            },
            primaryKey: (eventData: EventData<Shipment>) => {
              return eventData.latestEntity.id
            },
            tableName: 'shipment',
          }
        }, {// notify entity
          eventName: 'notify_entity',
          otherParameters: {
            partyGroupCode: (eventData: EventData<Booking>) => {
              return eventData.latestEntity.partyGroupCode
            },
            primaryKey: (eventData: EventData<Booking>) => {
              return eventData.latestEntity.id
            },
            tableName: 'booking',
            notifyKeys: {
              DEV: ['createdBy', 'forwarder'],
              STD: ['createdBy', 'forwarder']
            }
          },
        }
      ]
    },
    // fill shipping order
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
  'afterCreate_purchase-order': [],
  'afterUpdate_purchase-order': [],
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
            return shipmentContainers.reduce((nos: string[], { carrierBookingNo }: any) => {
              if (carrierBookingNo) {
                nos.push(carrierBookingNo)
              }
              return nos
            }, [])
          },
          containerNo: ({ shipmentContainers = [] }: any) => {
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
        primaryKey: (eventData: EventData<Booking>) => {
          return eventData.latestEntity.id
        },
        tableName: 'shipment'
      }
    },
    // create related person
    {
      eventName: 'create_related_person',
      otherParameters: {
        partyGroupCode: (eventData: EventData<Shipment>) => {
          return eventData.latestEntity.partyGroupCode
        },
        primaryKey: (eventData: EventData<Shipment>) => {
          return eventData.latestEntity.id
        },
        tableName: 'shipment',
        selectedPartyGroup: ['DEV', 'STD']
      },
      afterEvent: [
        {// resend alert
          condition: true,
          eventName: 'resend_alert',
          otherParameters: {
            partyGroupCode: (eventData: EventData<Shipment>) => {
              return eventData.latestEntity.partyGroupCode
            },
            primaryKey: (eventData: EventData<Shipment>) => {
              return eventData.latestEntity.id
            },
            tableName: 'shipment',
          }
        }
      ]
    }
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
            return shipmentContainers.reduce((nos: string[], { carrierBookingNo }: any) => {
              if (carrierBookingNo) {
                nos.push(carrierBookingNo)
              }
              return nos
            }, [])
          },
          containerNo: ({ shipmentContainers = [] }: any) => {
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
        primaryKey: (eventData: EventData<Booking>) => {
          return eventData.latestEntity.id
        },
        tableName: 'shipment'
      }
    },
    // create related person
    {
      eventName: 'create_related_person',
      otherParameters: {
        partyGroupCode: (eventData: EventData<Shipment>) => {
          return eventData.latestEntity.partyGroupCode
        },
        primaryKey: (eventData: EventData<Shipment>) => {
          return eventData.latestEntity.id
        },
        tableName: 'shipment',
        selectedPartyGroup: ['DEV', 'STD']
      },
      afterEvent: [
        {// resend alert
          condition: true,
          eventName: 'resend_alert',
          otherParameters: {
            partyGroupCode: (eventData: EventData<Shipment>) => {
              return eventData.latestEntity.partyGroupCode
            },
            tableName: 'shipment',
            primaryKey: (eventData: EventData<Shipment>) => {
              return eventData.latestEntity.id
            }
          }
        }
      ]
    }
  ],
  // shipment
  afterCreate_tracking: [
    // update data to entity
    {
      condition: true,
      eventName: 'update_data_from_tracking',
    },
  ],
  afterUpdate_tracking: [
    // update data to entity
    {
      condition: true,
      eventName: 'update_data_from_tracking',
    },
  ]
} as {
  [eventName: string]: (EventConfig | EventHandlerConfig)[]
}
