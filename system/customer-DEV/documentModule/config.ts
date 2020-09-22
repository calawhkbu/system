import { DocumentStorageConfig, EntityConfig } from 'modules/sequelize/interfaces/document'
// const devConfig = {
//   baseDir : '',
//   // external IP
//   host : 'localhost', // Internal IP: localhost, External IP: 192.168.1.3
//   os : 'window',
//   port: 22,
//   username: 'dev-sftp-DEV',
//   password : 'Swivel!'
// }

const uatConfig = {
  baseDir : '',
  // external IP
  host : 'localhost', // Internal IP: localhost, External IP: 192.168.1.3
  os : 'window',
  port: 22,
  username: 'uat-sftp-DEV',
  password : 'Swivel!'
}

const prodConfig = {
  baseDir : '',
  host : '172.31.149.238', // Internal IP: 172.31.149.238, External IP:47.244.181.139
  os : 'window',
  port: 22,
  username: 'sftp-DEV',
  password : 'Swivel!'
}
var devConfig =prodConfig;

export const documentStorageConfig = {
  maxFileSize: 10485760, // 10MB
  recyclePrefix: 'recycle',
  defaultHandlerName: 'dotnetSftp',
  // set this to true so that is will sarch by serverName
  searchServerName : true,
  handlerList: [
    { serverName : 'dev_server', config: devConfig, handlerName: 'dotnetSftp'},
    { serverName : 'dev_server', config: devConfig, handlerName: 'sftp' },
    { serverName : 'uat_server', config: uatConfig, handlerName: 'dotnetSftp'},
    { serverName : 'uat_server', config: uatConfig, handlerName: 'sftp' },
    { serverName : 'prod_server', config: prodConfig, handlerName: 'dotnetSftp' },
    { serverName : 'prod_server', config: prodConfig, handlerName: 'sftp' },
    { serverName : 'prod_edi_server', config: prodConfig, handlerName: 'dotnetSftp' },
    { serverName : 'prod_edi_server', config: prodConfig, handlerName: 'sftp' },
    { serverName : 'prod_schedule_server', config: prodConfig, handlerName: 'dotnetSftp' },
    { serverName : 'prod_schedule_server', config: prodConfig,  handlerName: 'sftp' },
  ]

} as DocumentStorageConfig

// extend from system
export const entityConfigList = [
]
