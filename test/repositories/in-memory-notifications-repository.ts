import { Notification } from '@/domain/notification/enterprise/entities/notification'
import { InMemoryBaseRepository } from './in-memory-base-repository'
import { NotificationRepository } from '@/domain/notification/application/repositories/notifications-repository'

export class InMemoryNotificationRepository
  extends InMemoryBaseRepository<Notification>
  implements NotificationRepository
{
  async findById(id: string): Promise<Notification | null> {
    return (
      this.data.find((notification) => notification.id.toString() === id) ??
      null
    )
  }

  async save(notification: Notification): Promise<void> {
    const itemIndex = this.data.findIndex((item) => item.id === notification.id)
    this.data[itemIndex] = notification
  }

  async create(notification: Notification): Promise<void> {
    this.data.push(notification)
  }
}
