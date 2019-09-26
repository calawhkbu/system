export default [
  {
    name: '850',
    active: true,
    schedule: '0 * * ? * *',
    // very important !!!!!! must use absolute path and end with slash
    searchPath: '/',
    searchExtensions: ['edi', 'txt'],
    storageConfig: {
      handlerName: 'sftp',
      config: {
        os: 'window',

        host: '18.162.98.163',
        port: '990',
        username: '360schedule',
        password: '360Swivel!',

        privateKey: ``,
      },
    },

    // the oubound name after parsing the edi
    outbound: 'someOutbound',
  },
]
