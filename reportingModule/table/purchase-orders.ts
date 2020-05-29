import { JqlDefinition } from 'modules/report/interface'

export default {
  jqls: [
    {
      type: 'callAxios',
      injectParams: true,
      axiosConfig: {
        method: 'POST',
        url: 'api/purchase-order/query/purchase-order',
      },
    }
  ],
  columns: [
    { key: 'updatedAt' },
    { key: 'id' },
    { key: 'poNo' },
    { key: 'referenceNumber' },
    { key: 'moduleTypeCode' },
    { key: 'incoTermsCode' },
    { key: 'freightTermsCode' },
    { key: 'portOfLoadingCode' },
    { key: 'portOfDischargeCode' },
    { key: 'departureDateEstimated' },
    { key: 'departureDateActual' },
    { key: 'departureDateRemark' },
    { key: 'arrivalDateEstimated' },
    { key: 'arrivalDateActual' },
    { key: 'arrivalDateRemark' },
    { key: 'shippingDateEstimated' },
    { key: 'shippingDateActual' },
    { key: 'shippingDateRemark' },
    { key: 'deliveryDateEstimated' },
    { key: 'deliveryDateActual' },
    { key: 'deliveryDateRemark' },
    { key: 'exitFactoryDateEstimated' },
    { key: 'exitFactoryDateActual' },
    { key: 'exitFactoryDateRemark' },
    { key: 'poDate' },
    { key: 'poDateRemark' },
    { key: 'dontShipBeforeDate' },
    { key: 'dontShipBeforeDateRemark' },
    { key: 'dontShipAfterDate' },
    { key: 'dontShipAfterDateRemark' },
    { key: 'shipperPartyCode' },
    { key: 'shipperPartyName' },
    { key: 'shipperPartyContactEmail' },
    { key: 'shipperPartyContactName' },
    { key: 'buyerPartyCode' },
    { key: 'buyerPartyName' },
    { key: 'buyerPartyContactEmail' },
    { key: 'buyerPartyContactName' },
    { key: 'factoryPartyCode' },
    { key: 'factoryPartyName' },
    { key: 'factoryPartyContactEmail' },
    { key: 'factoryPartyContactName' },
    { key: 'shipToPartyCode' },
    { key: 'shipToPartyName' },
    { key: 'shipToPartyContactEmail' },
    { key: 'shipToPartyContactName' },
    { key: 'productCode' },
    { key: 'productName' },
    { key: 'productSkuCode' },
    { key: 'productDesctiption' },
    { key: 'productCategoryName' },
    { key: 'productCategoryDesctiption' },
    { key: 'htsCode' },
    { key: 'lwh' },
    { key: 'ctn' },
    { key: 'totalCtns' },
    { key: 'weight' },
    { key: 'totalGrossWeight' },
    { key: 'totalVolume' },
    { key: 'quantity' },
    { key: 'totalQuantity' },
  ]
} as JqlDefinition

/* import { Query, FromTable } from 'node-jql'

const query = new Query({
  $from: new FromTable(
    {
      method: 'POST',
      url: 'api/purchase-order/query/purchase-order',
      columns: [
        {
          name: 'updatedAt',
          type: 'string',
        },
        {
          name: 'id',
          type: 'number',
        },
        {
          name: 'poNo',
          type: 'string',
        },
        {
          name: 'referenceNumber',
          type: 'string',
        },
        {
          name: 'moduleTypeCode',
          type: 'string',
        },
        {
          name: 'incoTermsCode',
          type: 'string',
        },
        {
          name: 'freightTermsCode',
          type: 'string',
        },
        {
          name: 'portOfLoadingCode',
          type: 'string',
        },
        {
          name: 'portOfDischargeCode',
          type: 'string',
        },
        {
          name: 'departureDateEstimated',
          type: 'string',
        },
        {
          name: 'departureDateActual',
          type: 'string',
        },
        {
          name: 'departureDateRemark',
          type: 'string',
        },
        {
          name: 'arrivalDateEstimated',
          type: 'string',
        },
        {
          name: 'arrivalDateActual',
          type: 'string',
        },
        {
          name: 'arrivalDateRemark',
          type: 'string',
        },
        {
          name: 'shippingDateEstimated',
          type: 'string',
        },
        {
          name: 'shippingDateActual',
          type: 'string',
        },
        {
          name: 'shippingDateRemark',
          type: 'string',
        },
        {
          name: 'deliveryDateEstimated',
          type: 'string',
        },
        {
          name: 'deliveryDateActual',
          type: 'string',
        },
        {
          name: 'deliveryDateRemark',
          type: 'string',
        },
        {
          name: 'exitFactoryDateEstimated',
          type: 'string',
        },
        {
          name: 'exitFactoryDateActual',
          type: 'string',
        },
        {
          name: 'exitFactoryDateRemark',
          type: 'string',
        },
        {
          name: 'poDate',
          type: 'string',
        },
        {
          name: 'poDateRemark',
          type: 'string',
        },
        {
          name: 'dontShipBeforeDate',
          type: 'string',
        },
        {
          name: 'dontShipBeforeDateRemark',
          type: 'string',
        },
        {
          name: 'dontShipAfterDate',
          type: 'string',
        },
        {
          name: 'dontShipAfterDateRemark',
          type: 'string',
        },
        {
          name: 'shipperPartyCode',
          type: 'string',
        },
        {
          name: 'shipperPartyName',
          type: 'string',
        },
        {
          name: 'shipperPartyContactEmail',
          type: 'string',
        },
        {
          name: 'shipperPartyContactName',
          type: 'string',
        },
        {
          name: 'buyerPartyCode',
          type: 'string',
        },
        {
          name: 'buyerPartyName',
          type: 'string',
        },
        {
          name: 'buyerPartyContactEmail',
          type: 'string',
        },
        {
          name: 'buyerPartyContactName',
          type: 'string',
        },
        {
          name: 'factoryPartyCode',
          type: 'string',
        },
        {
          name: 'factoryPartyName',
          type: 'string',
        },
        {
          name: 'factoryPartyContactEmail',
          type: 'string',
        },
        {
          name: 'factoryPartyContactName',
          type: 'string',
        },
        {
          name: 'shipToPartyCode',
          type: 'string',
        },
        {
          name: 'shipToPartyName',
          type: 'string',
        },
        {
          name: 'shipToPartyContactEmail',
          type: 'string',
        },
        {
          name: 'shipToPartyContactName',
          type: 'string',
        },
        {
          name: 'productCode',
          type: 'string',
        },
        {
          name: 'productName',
          type: 'string',
        },
        {
          name: 'productSkuCode',
          type: 'string',
        },
        {
          name: 'productDesctiption',
          type: 'string',
        },
        {
          name: 'productCategoryName',
          type: 'string',
        },
        {
          name: 'productCategoryDesctiption',
          type: 'string',
        },
        {
          name: 'htsCode',
          type: 'string',
        },
        {
          name: 'lwh',
          type: 'string',
        },
        {
          name: 'ctn',
          type: 'string',
        },
        {
          name: 'totalCtns',
          type: 'number',
        },
        {
          name: 'weight',
          type: 'string',
        },
        {
          name: 'totalGrossWeight',
          type: 'number',
        },
        {
          name: 'totalVolume',
          type: 'number',
        },
        {
          name: 'quantity',
          type: 'string',
        },
        {
          name: 'totalQuantity',
          type: 'number',
        },
      ],
    },
    'purchase_order'
  ),
})

export default query.toJson() */
