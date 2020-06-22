import { JwtPayload } from 'modules/auth/interfaces/jwt-payload'

export default (user: JwtPayload) => {
  return {
    person: {
      configuration: {
        locale: 'en',
        timezone: 'Asia/Hong_Kong',
        dateFormat: 'YYYY-MM-DD',
        timeFormat: 'HH:mm:ss',
        dateTimeFormat: 'YYYY-MM-DD HH:mm:ss',
        weekFormat: {
          dow: 1,
          doy: 4
        }
      }
    }
  }
}
