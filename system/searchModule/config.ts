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
      'controllingPartyPartyName',
      'notifyPartyPartyName',
      'warehousePartyName',
      'truckerPartyName',
      'customsBrokerPartyName',
    ],
    type: `shipment`,
    primaryKey: `{{entity.id}}`,
    title: `{{entity.houseNo}}`,
    subTitle: `
      <div>
        {% if entity.portOfLoadingName && entity.portOfDischargeName %}{{entity.portOfLoadingName}} => {{entity.portOfDischargeName}} /{% endif %}
        {% if entity.shipperPartyName %}/ {{entity.shipperPartyName}} /{% endif %}
        {% if entity.consigneePartyName %}/ {{entity.consigneePartyName}} /{% endif %}
        {% if entity.agentPartyName %}{{entity.agentPartyName}}{% endif %}
      </div>
    `
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
      'controllingPartyPartyName',
      'notifyPartyPartyName',
      'warehousePartyName',
      'truckerPartyName',
      'customsBrokerPartyName',
      'buyerPartyName'
    ],
    type: `{% if entity.shipmentId !== null %}shipment{% else %}booking{% endif %}`,
    primaryKey: `{% if entity.shipmentId !== null %}{{entity.shipmentId}}{% else %}{{entity.id}}{% endif %}`,
    title: `
      {% if entity.shipmentId !== null %}
        {{entity.houseNo}} ({{entity.bookingNo}})
      {% else %}
        {{entity.bookingNo}}
      {% endif %}
    `,
    subTitle: `
      <div>
        {% if entity.portOfLoadingName && entity.portOfDischargeName %}{{entity.portOfLoadingName}} => {{entity.portOfDischargeName}} /{% endif %}
        {% if entity.shipperPartyName %}/ {{entity.shipperPartyName}} /{% endif %}
        {% if entity.consigneePartyName %}/ {{entity.consigneePartyName}} /{% endif %}
        {% if entity.agentPartyName %}{{entity.agentPartyName}}{% endif %}
      </div>
    `,
    limit: 10,
    charLimit: 50
  }
}
