import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Either, right } from '@/core/types/either'
import { Notification } from '@/domain/notification/enterprise/entities/notification'
import { NotificationRepository } from '@/domain/notification/application/repositories/notifications-repository'
import { Injectable } from '@nestjs/common'

export type Params = {
  recipientId: string
  title: string
  content: string
}

export type Return = Either<
  null,
  {
    notification: Notification
  }
>

@Injectable()
export class SendNotificationUseCase {
  constructor(private notificationRepository: NotificationRepository) {}

  async execute({ recipientId, title, content }: Params): Promise<Return> {
    const notification = Notification.create({
      recipientId: new UniqueEntityID(recipientId),
      title,
      content,
    })

    await this.notificationRepository.create(notification)

    return right({ notification })
  }
}
