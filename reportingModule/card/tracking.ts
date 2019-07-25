import { BadRequestException } from "@nest/core";
import moment from 'moment'
import { Query, FromTable, CreateTableJQL } from "node-jql";

export default [
  [function (require, session, params) {
    const subqueries = params.subqueries
    if (!subqueries || !subqueries.jobDate) throw new BadRequestException('MISSING_DATE_RANGE')
    const datefr = moment(subqueries.jobDate.from, 'YYYY-MM-DD')
    const dateto = moment(subqueries.jobDate.to, 'YYYY-MM-DD')
    if (dateto.diff(datefr, 'years', true) > 1) throw new BadRequestException('DATE_RANGE_TOO_LARGE')
    return params
  }, new CreateTableJQL({
    $temporary: true,
    name: 'shipments',
    $as: new Query({
      $from: new FromTable({
        method: 'POST',
        url: 'api/shipment/query/shipment',
        columns: [
          // TODO
        ]
      }, 'shipments')
    })
  })],

]