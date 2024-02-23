import { makeNotification } from 'test/factory/make-notification'
import { ReadNotificationUseCase } from './read-notification'
import { InMemoryNotificationRepository } from 'test/repositories/in-memory-notifications-repository'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { NotAllowedError } from '@/core/errors/not-allowed-error'

let inMemoryNotificationRepository: InMemoryNotificationRepository
let systemUnderTest: ReadNotificationUseCase

describe('ReadNotificationUseCase', () => {
  beforeAll(() => {
    inMemoryNotificationRepository = new InMemoryNotificationRepository()
    systemUnderTest = new ReadNotificationUseCase(
      inMemoryNotificationRepository,
    )
  })

  beforeEach(() => {
    inMemoryNotificationRepository.reset()
  })

  it('should be able to read a notification', async () => {
    const notification = makeNotification()

    await inMemoryNotificationRepository.create(notification)

    const result = await systemUnderTest.execute({
      notificationId: notification.id.toString(),
      recipientId: notification.recipientId.toString(),
    })

    expect(result.isRight()).toBeTruthy()
    expect(inMemoryNotificationRepository.data[0].readAt).toEqual(
      expect.any(Date),
    )
  })

  it('should not be able to read a notification from another author', async () => {
    const notification = makeNotification(
      { recipientId: new UniqueEntityID('recipient1') },
      new UniqueEntityID('any_id'),
    )
    await inMemoryNotificationRepository.create(notification)

    const result = await systemUnderTest.execute({
      notificationId: notification.id.toString(),
      recipientId: 'recipient2',
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(NotAllowedError)
  })
})
