export default [
  {
    name: '850',
    active: true,
    schedule: '0 * * ? * *',

    // very important !!!!!! must use absolute path and end with slash
    searchPath: '/home/ec2-user/ftptest/',

    searchExtensions: ['edi', 'txt'],

    // searchPath : 'C:\\home\\ec2-user\\ftptest\\',

    storageConfig: {
      handlerName: 'sftp',
      config: {
        os: 'linux',

        host: '13.229.70.248',
        port: '22',
        username: 'ec2-user',

        privateKey: `privateKey`,
      },
    },

    // the oubound name after parsing the edi
    outbound: 'someOutbound',
  },
]
