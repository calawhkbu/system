import { Query, FromTable } from 'node-jql'

const query = new Query({
  $distinct: true,
  $from: new FromTable(
    {
      method: 'POST',
      url: 'api/task/query/task',
      columns: [
        {
          name: 'id',
          type: 'number',
        },
        {
          name: 'taskId',
          type: 'string',
        },
        {
          name: 'taskName',
          type: 'string',
        },
        {
          name: 'data',
          type: 'string',
        },
        {
          name: 'result',
          type: 'string',
        },
        {
          name: 'error',
          type: 'string',
        },

        {
          name: 'workerId',
          type: 'string',
        },

        {
          name: 'status',
          type: 'string',
        },

        {
          name: 'registerAt',
          type: 'string',
        },
        {
          name: 'runAt',
          type: 'string',
        },
        {
          name: 'closeAt',
          type: 'string',
        },
        {
          name: 'updatedAt',
          type: 'string',
        },
      ],
    },
    'user'
  ),
})

export default query.toJson()
