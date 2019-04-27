// import crypto from 'crypto'

export default {
  method: 'POST-JSON',
  getUrl: () => {
    // console.log(crypto)
    return 'https://eu1-gateway.invenio.qwyk.io/jwt/api-token-auth'
  },
  bodyHandler: () => {
    return {
      username: 'swivel@qwyk.io',
      password: '3Fpzkc5xCjtC3wD39tDMmG9UeJwZ4NJa'
    }
  }
}
