export default async function test() {
  async function tick(count, ms) {
    return new Promise(resolve => {
      setTimeout(() => {
        console.debug(`Tick ${count}`, 'Testing internal job')
        return count === 0 ? resolve() : tick(count - 1, ms)
      }, ms)
    })
  }
  await tick(10, 1000)
}