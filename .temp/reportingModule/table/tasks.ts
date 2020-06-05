import { JqlDefinition } from 'modules/report/interface'

export default {
  jqls: [
    {
      type: 'callDataService',
      dataServiceQuery: ['task', 'task']
    }
  ],
  columns: [
    { key: 'id' },
    { key: 'taskId' },
    { key: 'taskName' },
    { key: 'data' },
    { key: 'result' },
    { key: 'error' },
    { key: 'workerId' },
    { key: 'status' },
    { key: 'registerAt' },
    { key: 'runAt' },
    { key: 'closeAt' },
    { key: 'updatedAt' },
  ]
} as JqlDefinition

/* import { Query, FromTable } from 'node-jql'

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

export default query.toJson() */
