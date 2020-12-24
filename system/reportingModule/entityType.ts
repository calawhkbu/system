export const entityTypeList=  {
  display: 'entityType',
  name: 'entityType',
  props: {
    items: [{
      label: 'Booking',
      value: 'booking',
    }, 
    {
      label: 'Shipment',
      value: 'shipment',
    },
    {
      label: 'purchase_order',
      value: 'purchase_order',
    }
  ],
    multi: false,
    required: true,
  },
  type: 'list',
}
