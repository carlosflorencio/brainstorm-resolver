import Encryption from '../src/storm/Encryption'

const message = 'this is my message'
const hashString = 'NM8qGmqv/Ghsix6eIi+FcyTjeB1ONjjkedGC0FsHJFA='

const obj = {
  action: 'live'
}
const hashObject = 'jmYJSzQKF7GpgN7i0vVuH0e2o4fm3i4j8DtE3QTf3Y0='

test('crypt string', () => {
  const hash = Encryption.encrypt(message)

  expect(hash).toBe(hashString)
})

test('decrypt string', () => {
  const res = Encryption.decrypt(hashString)

  expect(res).toBe(message)
})

test('crypt object', () => {
  const str = JSON.stringify(obj)
  const hash = Encryption.encrypt(str)

  expect(hash).toBe(hashObject)
})

test('decrypt object', () => {
  const res = Encryption.decrypt(hashObject)

  expect(JSON.parse(res)).toEqual(obj)
})
