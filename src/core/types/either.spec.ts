import { Either, left, right } from './either'

function execute(shouldSuccess: boolean): Either<string, number> {
  return shouldSuccess ? right(10) : left('failure')
}

test('sucess result', () => {
  const success = execute(true)

  expect(success.isRight()).toBeTruthy()
  expect(success.isLeft()).toBeFalsy()
})

test('failure result', () => {
  const failure = execute(false)

  expect(failure.isLeft()).toBeTruthy()
  expect(failure.isRight()).toBeFalsy()
})
