import { ColumnExpression, ResultColumn } from 'node-jql'

export default {
  shipment: {
    title: ['houseNo'],
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
    subTitle: `
    <div>{{entity.portOfLoadingName}} => {{entity.portOfDischargeName}} / {{entity.shipperPartyName}} / {{entity.consigneePartyName}} / {{entity.agentPartyName}} </div>
    `,
    limit: 10,
    charLimit: 50
  },
  booking: {
    title: ['bookingNo'],
    fields: [
      new ResultColumn(new ColumnExpression('booking', '*')),
      'shipperPartyName',
      'consigneePartyName',
      'roAgentPartyName',
      'linerAgentPartyName',
      'forwarderPartyName',
      'controllingCustomerPartyName',
      'agentPartyName',
    ],
    subTitle: `
    <div>{{entity.portOfLoadingName}} => {{entity.portOfDischargeName}} / {{entity.shipperPartyName}} / {{entity.consigneePartyName}} / {{entity.agentPartyName}} </div>
    `,
    limit: 10,
    charLimit: 50
  }
}
