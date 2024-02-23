import { AttachmentRepository } from '@/domain/forum/application/repositories/attachments-repository'
import { Attachment } from '@/domain/forum/enterprise/entities/attachment'
import { InMemoryBaseRepository } from './in-memory-base-repository'

export class InMemoryAttachmentsRepository
  extends InMemoryBaseRepository<Attachment>
  implements AttachmentRepository
{
  async create(attachment: Attachment) {
    this.data.push(attachment)
  }
}
