export default async function test() {
  const VALUE = 10
  const this_ = this
  async function tick(count, ms) {
    return new Promise(resolve => {
      setTimeout(async() => {
        await this_.log(`Tick ${count}/${VALUE}`)
        return count === 0 ? resolve() : resolve(tick(count - 1, ms))
      }, ms)
    })
  }
  await tick(VALUE, 1000)
}