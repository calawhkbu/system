import { JqlDefinition } from 'modules/report/interface'
import BookingJql from './bookings'

export default {
  jqls: [
    BookingJql.jqls[0],
    {
      type: 'callDataService',
      dataServiceType: 'count',
      dataServiceQuery: ['booking', 'booking']
    }
  ],
  columns: [
    { key: 'count' },
  ],
} as JqlDefinition
