//TODO NEED TO UPDATE THE ACTUAL RULES
module.exports = {
  defaultStatus: 'Booked',
  statusList: [
    {
      name: 'Booked',
      validationRules: [],
      tags: {},
      onEnterRule:
        "isSent = sendNotifications(booking,{entityName:'booking',rolesToEmail:['ConsigneeUser'],useMeta:false})",
      roles: ['SwivelAdmin', 'Admin', 'User'],
      generatedDate: 'gDate = date(booking.createdAt); var aDate=date(booking.createdAt)',
      actualDate: 'aDate = date(booking.createdAt);',
      trackingStatus: 'Booked',
    },
    {
      name: 'Shipping Advice Ready (SEA)',
      validationRules: [
        {
          script: "result = documentExists(booking,['Shipping Advice'])",
          error: 'Please upload Shipping Advice to move forward',
          action: '/widgets/booking-cards/DocumentsUpload.js',
          parameters: {
            allowUpdate: true,
            fields: [],
            missingFiles: ['Shipping Advice'],
          },
        },
        {
          script: 'result = (booking.commodity && booking.commodity.length>0)',
          error: 'Commodity should not be empty.',
          action: '/widgets/booking-cards/RemoteComponent.js',
          parameters: {
            allowUpdate: true,
            fields: ['Commodity'],
          },
        },
      ],
      tags: {
        moduleType: 'SEA',
      },
      onEnterRule:
        "isSent =  sendNotifications(booking,{entityName:'booking',rolesToEmail:['ConsigneeUser','ShipperUser'],useMeta:false})",
      roles: ['SwivelAdmin', 'Admin', 'User'],
      action: '/document/create/shippingAdvice',
      generatedDate: 'gDate = date(booking.estimatedDepartureDate); gDate= gDate.addDays(-2)',
    },
    {
      name: 'Shipping Advice Ready (AIR)',
      validationRules: [
        {
          script: "result = documentExists(booking,['Shipping Advice'])",
          error: 'Please upload Shipping Advice to move forward',
          action: '/widgets/booking-cards/DocumentsUpload.js',
          parameters: {
            allowUpdate: true,
            fields: [],
            missingFiles: ['Shipping Advice'],
          },
        },
        {
          script: 'result = (booking.commodity && booking.commodity.length>0)',
          error: 'Commodity should not be empty.',
          action: '/widgets/booking-cards/RemoteComponent.js',
          parameters: {
            allowUpdate: true,
            fields: ['Commodity'],
          },
        },
      ],
      tags: {
        moduleType: 'AIR',
      },
      onEnterRule:
        "isSent =  sendNotifications(booking,{entityName:'booking',rolesToEmail:['ConsigneeUser','ShipperUser'],useMeta:false})",
      roles: ['SwivelAdmin', 'Admin', 'User'],
      action: '/document/create/shippingAdvice',
      generatedDate: 'gDate = date(booking.estimatedDepartureDate); gDate= gDate.addDays(-2)',
    },
    {
      name: 'Shipping Advice Confirmed',
      validationRules: [
        {
          script: "result = documentConfirmed(booking,['Shipping Advice'])",
          error: 'Shipping Advice file not found.',
          action: '/widgets/booking-cards/DocumentsUpload.js',
          parameters: {
            allowUpdate: true,
            fields: [],
            missingFiles: ['Shipping Advice'],
          },
        },
      ],
      tags: {},
      onEnterRule:
        "isSent = sendNotifications(booking,{entityName:'booking',rolesToEmail:['ConsigneeUser', 'AgentUser', 'ShipperUser', 'ForwarderUser'],useMeta:false})",
      roles: ['SwivelAdmin', 'Admin', 'User'],
      action: '/document/confirm/shippingAdvice',
      generatedDate: 'gDate = date(booking.estimatedDepartureDate); gDate= gDate.addDays(-1)',
    },
    {
      name: 'Shipping Instructions Ready',
      validationRules: [
        {
          script: "result = documentExists(booking,['Shipping Instructions'])",
          error: 'Shipping Instructions not found.',
          action: '/widgets/booking-cards/DocumentsUpload.js',
          parameters: {
            allowUpdate: true,
            missingFiles: ['Shipping Instructions'],
          },
        },
        {
          script: "result = checkIsPresent(booking, ['portOfLoading','portOfDischarge'])",
          error: "You must input the 'Port of loading' and 'Port of discharge' to continue.",
          action: '/widgets/booking-cards/BasicError.js',
          parameters: {
            allowUpdate: true,
            fields: ['Port of loading', 'Port of discharge'],
            missingFiles: [],
          },
        },
      ],
      tags: {},
      onEnterRule:
        "isSent = sendNotifications(booking,{entityName:'booking',rolesToEmail:['ConsigneeUser', 'AgentUser', 'ShipperUser', 'ForwarderUser'],useMeta:false})",
      roles: ['SwivelAdmin', 'Admin', 'User'],
      generatedDate: 'gDate = date(booking.estimatedDepartureDate);',
      action: '',
    },
    {
      name: 'HBL Ready',
      validationRules: [],
      roles: ['SwivelAdmin', 'Admin', 'User'],
      tags: {},
      action: '',
      generatedDate: 'gDate = date(booking.estimatedDepartureDate); gDate= gDate.addDays(2)',
    },
    {
      name: 'ASN Ready',
      validationRules: [],
      roles: ['SwivelAdmin', 'Admin', 'User'],
      tags: {},
      action: '',
      generatedDate: 'gDate = date(booking.estimatedDepartureDate); gDate= gDate.addDays(3)',
    },
    {
      name: 'ASN Doc Checked',
      validationRules: [],
      generatedDate: 'gDate = date(booking.estimatedArrivalDate); gDate= gDate.addDays(2)',
      roles: ['SwivelAdmin', 'Admin', 'User'],
      tags: {},
      action: '',
    },
    {
      name: 'ASN Doc Approved',
      validationRules: [],
      generatedDate: 'gDate = date(booking.estimatedArrivalDate); gDate= gDate.addDays(2)',
      roles: ['SwivelAdmin', 'Admin', 'User'],
      tags: {},
      action: '',
    },
    {
      name: 'Completed',
      validationRules: [],
      generatedDate: 'gDate = date(booking.estimatedArrivalDate); gDate= gDate.addDays(2)',
      roles: ['SwivelAdmin', 'Admin', 'User'],
      tags: {},
      action: '',
    },
    {
      name: 'Cancelled',
      validationRules: '',
      roles: ['SwivelAdmin', 'Admin', 'User'],
      tags: {},
      action: '/cancel-booking',
    },
  ],
  transitions: {
    Booked: {
      allowableNextStates: ['Shipping Advice Ready (SEA)', 'Shipping Advice Ready (AIR)'],
      requiredActions: ['Create Shipping Advice'],
    },
    'Shipping Advice Ready (SEA)': {
      allowableNextStates: ['Shipping Advice Confirmed', 'Cancelled'],
      requiredActions: ['Approve Shipping Advice'],
    },
    'Shipping Advice Ready (AIR)': {
      allowableNextStates: ['Shipping Advice Confirmed', 'Cancelled'],
      requiredActions: ['Approve Shipping Advice'],
    },
    'Shipping Advice Confirmed': {
      allowableNextStates: ['Shipping Instructions Ready'],
      requiredActions: ['Create Shipping Instructions'],
    },
    'Shipping Instructions Ready': {
      allowableNextStates: ['HBL Ready'],
      requiredActions: ['Upload House B/L'],
    },
    'HBL Ready': {
      allowableNextStates: ['ASN Ready'],
      requiredActions: ['Create ASN'],
    },
    'ASN Ready': {
      allowableNextStates: ['ASN Doc Checked'],
      requiredActions: ['Check ASN'],
    },
    'ASN Doc Checked': {
      allowableNextStates: ['ASN Doc Approved'],
      requiredActions: ['Approve ASN'],
    },
    'ASN Doc Approved': {
      allowableNextStates: ['Completed'],
      requiredActions: ['Complete Shipment'],
    },
    Completed: {
      allowableNextStates: [],
    },
    Cancelled: {
      allowableNextStates: [],
    },
  },
}
