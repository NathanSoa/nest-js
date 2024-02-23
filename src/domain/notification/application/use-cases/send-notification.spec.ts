import { SendNotificationUseCase } from './send-notification'
import { InMemoryNotificationRepository } from 'test/repositories/in-memory-notifications-repository'

let inMemoryNotificationRepository: InMemoryNotificationRepository
let systemUnderTest: SendNotificationUseCase

describe('SendNotificationUseCase', () => {
  beforeAll(() => {
    inMemoryNotificationRepository = new InMemoryNotificationRepository()
    systemUnderTest = new SendNotificationUseCase(
      inMemoryNotificationRepository,
    )
  })

  beforeEach(() => {
    inMemoryNotificationRepository.reset()
  })

  it('should be able to send a notification', async () => {
    const result = await systemUnderTest.execute({
      recipientId: 'any_id',
      title: 'any_title',
      content: 'any_content',
    })

    expect(result.isRight()).toBeTruthy()
    expect(inMemoryNotificationRepository.data[0]).toEqual(
      result.value?.notification,
    )
  })
})
