import { Query, FromTable } from 'node-jql'

const query = new Query({
  $from: new FromTable(
    {
      method: 'POST',
      url: 'api/shipment/query/shipment',
      columns: [
        {
          name: 'houseNo',
          type: 'string',
        },

        {
          // warning  : DATE ("YYYY-MM-DD")
          name: 'jobDate',
          type: 'string',
        },

        {
          name: 'masterNo',
          type: 'string',
        },

        {
          name: 'bookingNo',
          type: 'string',
        },

        {
          name: 'poNo',
          type: 'string',
        },

        {
          name: 'contractNo',
          type: 'string',
        },

        {
          name: 'commodity',
          type: 'string',
        },

        {
          name: 'carrierName',
          type: 'string',
        },

        {
          name: 'carrierCode',
          type: 'string',
        },

        {
          name: 'vesselVoyage',
          type: 'string',
        },

        {
          name: 'division',
          type: 'string',
        },

        // ["FCL", "LCL", "CONSOL"]
        {
          name: 'serviceType',
          type: 'string',
        },

        {
          name: 'incoTerms',
          type: 'string',
        },

        {
          name: 'freightTerms',
          type: 'string',
        },

        {
          name: 'otherTerms',
          type: 'string',
        },

        // ["SEA", "AIR", "ROAD"]
        {
          name: 'moduleType',
          type: 'string',
        },

        {
          name: 'boundType',
          type: 'string',
        },
        {
          name: 'serviceType',
          type: 'string',
        },
        {
          name: 'nominatedType',
          type: 'string',
        },
        {
          name: 'isDirect',
          type: 'string',
        },
        {
          name: 'isCoload',
          type: 'string',
        },
        {
          name: 'porCode',
          type: 'string',
        },
        {
          name: 'porName',
          type: 'string',
        },
        {
          name: 'polCode',
          type: 'string',
        },
        {
          name: 'polName',
          type: 'string',
        },

        {
          name: 'podCode',
          type: 'string',
        },
        {
          name: 'podName',
          type: 'string',
        },
        {
          name: 'pldCode',
          type: 'string',
        },
        {
          name: 'pldName',
          type: 'string',
        },
        {
          name: 'fdCode',
          type: 'string',
        },
        {
          name: 'fdName',
          type: 'string',
        },
        {
          name: 'estimatedDepartureDate',
          type: 'string',
        },
        {
          name: 'estimatedArrivalDate',
          type: 'string',
        },
        {
          name: 'actualDepartureDate',
          type: 'string',
        },
        {
          name: 'actualArrivalDate',
          type: 'string',
        },
        {
          name: 'forwarderPartyName',
          type: 'string',
        },
        {
          name: 'forwarderPartyCustomCode',
          type: 'string',
        },
        {
          name: 'forwarderPartryShortName',
          type: 'string',
        },
        {
          name: 'forwarderPartyNature',
          type: 'string',
        },
        {
          name: 'forwarderPartyCityCode',
          type: 'string',
        },
        {
          name: 'forwarderPartyStateCode',
          type: 'string',
        },

        {
          name: 'forwarderPartyCountryCode',
          type: 'string',
        },
        {
          name: 'shipperPartyName',
          type: 'string',
        },
        {
          name: 'shipperPartyCustomCode',
          type: 'string',
        },
        {
          name: 'shipperPartryShortName',
          type: 'string',
        },
        {
          name: 'shipperPartyNature',
          type: 'string',
        },
        {
          name: 'shipperPartyCityCode',
          type: 'string',
        },
        {
          name: 'shipperPartyStateCode',
          type: 'string',
        },
        {
          name: 'shipperPartyCountryCode',
          type: 'string',
        },
        {
          name: 'consigneePartyName',
          type: 'string',
        },
        {
          name: 'consigneePartyCustomCode',
          type: 'string',
        },
        {
          name: 'consigneePartryShortName',
          type: 'string',
        },
        {
          name: 'consigneePartyNature',
          type: 'string',
        },

        {
          name: 'consigneePartyCityCode',
          type: 'string',
        },

        {
          name: 'consigneePartyStateCode',
          type: 'string',
        },
        {
          name: 'consigneePartyCountryCode',
          type: 'string',
        },
        {
          name: 'linerAgentPartyName',
          type: 'string',
        },
        {
          name: 'linerAgentPartyCustomCode',
          type: 'string',
        },
        {
          name: 'linerAgentPartryShortName',
          type: 'string',
        },
        {
          name: 'linerAgentPartyNature',
          type: 'string',
        },

        {
          name: 'linerAgentPartyCityCode',
          type: 'string',
        },
        {
          name: 'linerAgentPartyStateCode',
          type: 'string',
        },
        {
          name: 'linerAgentPartyCountryCode',
          type: 'string',
        },

        {
          name: 'roAgentPartyName',
          type: 'string',
        },

        {
          name: 'roAgentPartyCustomCode',
          type: 'string',
        },
        {
          name: 'roAgentPartryShortName',
          type: 'string',
        },
        {
          name: 'roAgentPartyNature',
          type: 'string',
        },
        {
          name: 'roAgentPartyCityCode',
          type: 'string',
        },
        {
          name: 'roAgentPartyStateCode',
          type: 'string',
        },
        {
          name: 'roAgentPartyCountryCode',
          type: 'string',
        },
        {
          name: 'agentPartyName',
          type: 'string',
        },
        {
          name: 'agentPartyCustomCode',
          type: 'string',
        },
        {
          name: 'agentPartryShortName',
          type: 'string',
        },
        {
          name: 'agentPartyNature',
          type: 'string',
        },
        {
          name: 'agentPartyCityCode',
          type: 'string',
        },
        {
          name: 'agentPartyStateCode',
          type: 'string',
        },
        {
          name: 'agentPartyCountryCode',
          type: 'string',
        },
        {
          name: 'controllingCustomerPartyName',
          type: 'string',
        },
        {
          name: 'controllingCustomerPartyCustomCode',
          type: 'string',
        },
        {
          name: 'controllingCustomerPartryShortName',
          type: 'string',
        },
        {
          name: 'controllingCustomerPartyNature',
          type: 'string',
        },
        {
          name: 'controllingCustomerPartyCityCode',
          type: 'string',
        },
        {
          name: 'controllingCustomerPartyStateCode',
          type: 'string',
        },
        {
          name: 'controllingCustomerPartyCountryCode',
          type: 'string',
        },

        {
          name: 'rSalesmanCode',
          type: 'string',
        },
        {
          name: 'rSalesmanName',
          type: 'string',
        },

        {
          name: 'cSalesmanCode',
          type: 'string',
        },

        {
          name: 'cSalesmanName',
          type: 'string',
        },

        // TODO
      ],
    },
    'shipment'
  ),
})

export default query.toJson()
