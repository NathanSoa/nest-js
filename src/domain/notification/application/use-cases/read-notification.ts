import { Either, left, right } from '@/core/types/either'
import { Notification } from '@/domain/notification/enterprise/entities/notification'
import { NotificationRepository } from '@/domain/notification/application/repositories/notifications-repository'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { NotAllowedError } from '@/core/errors/not-allowed-error'
import { Injectable } from '@nestjs/common'

type Params = {
  notificationId: string
  recipientId: string
}

type Return = Either<
  NotAllowedError | ResourceNotFoundError,
  {
    notification: Notification
  }
>

@Injectable()
export class ReadNotificationUseCase {
  constructor(private notificationRepository: NotificationRepository) {}

  async execute({ notificationId, recipientId }: Params): Promise<Return> {
    const notification =
      await this.notificationRepository.findById(notificationId)

    if (!notification) {
      return left(new ResourceNotFoundError())
    }

    if (notification.recipientId.toString() !== recipientId) {
      return left(new NotAllowedError())
    }

    notification.read()

    await this.notificationRepository.save(notification)

    return right({ notification })
  }
}
