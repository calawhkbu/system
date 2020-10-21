export default {
  dataSetting: {
    shipment: {
      override: {
        // query
        job: 'erp-joblockrpt',
        profit: 'erp-vsiteanalysis',
        // 'shipment-status': 'old360-shipment-status',
        // 'shipment': 'old360-shipments', // 'erp-shipments',
        // // count
        // 'shipment-count': 'old360-shipments-count', // 'erp-shipments-count',
        // // crud
        // 'findOne': 'old360-shipment'
      }
    }
  },
  bookingContainer : {
    calculateCtns : false
  },
  cards: {
    'Profit': true,
    'Demo': true,
    'Booking': true,
    'Shipment': true,
    'Tools': true,
    'Tracking': true,
    'Alert': true,
    'Job': true,
    'Task': true,
    'Purchase Order': true,
    'Base': true
  }
}
