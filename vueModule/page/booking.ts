export default {
  layout: 'MainLayout',
  components: [
    {
      is: 'Widget',
      props: {
        initUrl: 'api/booking/{{id}}',
        primaryKey: 'id',
        modes: ['assignment', 'quickCreate', 'create', 'edit', 'map', 'import', 'copy'],
      },
    },
  ],
}
