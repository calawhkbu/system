export default {
  method: 'POST-JSON', // GET / POST-JSON / POST-SIMPLE
  getUrl: () => {
    return 'https://eu1-gateway.invenio.qwyk.io/schedules/v1/schedules?mode=async&schema=extended'
  },
  responseHandler: (response: any) => {
    return response
  }
}
