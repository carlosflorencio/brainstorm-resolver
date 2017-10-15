import BrainstormService from '../src/storm/BrainstormService'

test('is live', () => {
  expect.assertions(1)

  return BrainstormService.isLive().then(res => {
    expect(res).toBe(false)
  })
})

test('get test question', () => {
  expect.assertions(1)

  return BrainstormService.getTestQuestion().then(res => {
    expect(res).toBe(false)
  })
})

test('login', () => {
  expect.assertions(1)

  const email = 'test@user.com'
  const password = 'passregistered'

  return BrainstormService.login(email, password).then(res => {
    expect(res.name).toBe('User')
  })
})

test('submit answer', () => {
  expect.assertions(1)

  const userId = 1245
  const questionId = 654
  const answer = 1

  return BrainstormService.submitAnswer(
    userId,
    questionId,
    answer
  ).then(res => {
    expect(res).toBe(false)
  })
})

test('config', () => {
  expect.assertions(1)

  return BrainstormService.config().then(res => {
    expect(res).toBe(false)
  })
})

test('live result', () => {
  expect.assertions(1)

  const userId = 7845
  return BrainstormService.liveResults(userId).then(res => {
    expect(res).toBe(0)
  })
})
