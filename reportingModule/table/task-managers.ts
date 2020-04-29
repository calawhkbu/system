import { Query, FromTable } from 'node-jql'

const query = new Query({
  $distinct: true,
  $from: new FromTable(
    {
      method: 'POST',
      url: 'api/taskManager/query/task_manager',
      columns: [
        {
          name: 'id',
          type: 'number',
        },
        {
          name: 'active',
          type: 'boolean',
        },
        {
          name: 'taskName',
          type: 'string',
        },
        {
          name: 'workerHandlerName',
          type: 'string',
        },

        {
          name: 'taskLimit',
          type: 'number',
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
