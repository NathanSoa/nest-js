import { RegisterStudentUseCase } from './register-student'
import { InMemoryStudentRepository } from 'test/repositories/in-memory-student-repository'
import { FakeHasher } from 'test/cryptography/fake-hasher'

let inMemoryStudentRepository: InMemoryStudentRepository
let fakeHasher: FakeHasher
let systemUnderTest: RegisterStudentUseCase

describe('RegisterStudentUseCase', () => {
  beforeAll(() => {
    inMemoryStudentRepository = new InMemoryStudentRepository()
    fakeHasher = new FakeHasher()
    systemUnderTest = new RegisterStudentUseCase(
      inMemoryStudentRepository,
      fakeHasher,
    )
  })

  beforeEach(() => {
    inMemoryStudentRepository.reset()
  })

  it('should be able to register a new student', async () => {
    const result = await systemUnderTest.execute({
      name: 'John Doe',
      email: 'joh@doe.com',
      password: 'password',
    })

    expect(result.isRight()).toBeTruthy()
    expect(result.value).toEqual({
      student: inMemoryStudentRepository.data[0],
    })
  })

  it('should hash student password upon registration', async () => {
    const result = await systemUnderTest.execute({
      name: 'John Doe',
      email: 'joh@doe.com',
      password: 'password',
    })

    expect(result.isRight()).toBeTruthy()
    expect(inMemoryStudentRepository.data[0].password).toBe('password-hashed')
  })
})
