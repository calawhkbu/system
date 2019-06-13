import moment = require('moment')

export default async function bookingNoGeneraror (booking: any) {
  const date = moment.utc().format('YYMMDD')
  let random = (Math.floor(Math.random() * 9999)).toString()
  if (random.length === 3) {
    random = `0${random}`
  } else if (random.length === 2) {
    random = `00${random}`
  } else if (random.length === 1) {
    random = `000${random}`
  } else if (random.length === 0) {
    random = `0000`
  }
  return `01-${date}${random}`
}
