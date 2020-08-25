import { ColumnExpression, ResultColumn } from 'node-jql'

export default {
  shipment: {
    fields: [
      new ResultColumn(new ColumnExpression('shipment', '*')),
      'shipperPartyName',
      'consigneePartyName',
      'roAgentPartyName',
      'linerAgentPartyName',
      'officePartyName',
      'controllingCustomerPartyName',
      'agentPartyName',
    ],
    type: `shipment`,
    primaryKey: `{{entity.id}}`,
    title: `{{entity.houseNo}}`,
    subTitle: `<div>{{entity.portOfLoadingName}} => {{entity.portOfDischargeName}} / {{entity.shipperPartyName}} / {{entity.consigneePartyName}} / {{entity.agentPartyName}} </div>`
  },
  booking: {
    fields: [
      new ResultColumn(new ColumnExpression('booking', '*')),
      'shipmentId',
      'houseNo',
      'shipperPartyName',
      'consigneePartyName',
      'roAgentPartyName',
      'linerAgentPartyName',
      'forwarderPartyName',
      'controllingCustomerPartyName',
      'agentPartyName',
    ],
    type: `{% if entity.shipmentId !== null %}shipment{% else %}booking{% endif %}`,
    primaryKey: `{% if entity.shipmentId !== null %}{{entity.shipmentId}}{% else %}{{entity.id}}{% endif %}`,
    title: `{% if entity.shipmentId !== null %}{{entity.houseNo || entity.bookingNo}}{% else %}{{entity.bookingNo}}{% endif %}`,
    subTitle: `<div>{{entity.portOfLoadingName}} => {{entity.portOfDischargeName}} / {{entity.shipperPartyName}} / {{entity.consigneePartyName}} / {{entity.agentPartyName}} </div>`,
    limit: 10,
    charLimit: 50
  }
}
