
import { EdiConfig } from 'modules/edi/service'

export default [

    {
        ediType : '850',
        schedule : '0 * * * *',

        // very important !!!!!! must use absolute path and end with slash
        searchPath : '/home/ec2-user/ftptest/',

        // searchPath : 'C:\\home\\ec2-user\\ftptest\\',

        inboundStorage : {

            handlerName : 'sftp',
            config: {

                os : 'linux',

                host: '13.229.70.248',
                port: '22',
                username: 'ec2-user',

                privateKey : `privateKey`
              }

        },

        outbound : 'someOutbound'

    }

] as EdiConfig[]
