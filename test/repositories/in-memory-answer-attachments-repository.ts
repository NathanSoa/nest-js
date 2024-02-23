import { InMemoryBaseRepository } from './in-memory-base-repository'
import { AnswerAttachmentsRepository } from '@/domain/forum/application/repositories/answer-attachments-repository'
import { AnswerAttachment } from '@/domain/forum/enterprise/entities/answer-attachment'

export class InMemoryAnswerAttachmentsRepository
  extends InMemoryBaseRepository<AnswerAttachment>
  implements AnswerAttachmentsRepository
{
  async createMany(attachments: AnswerAttachment[]): Promise<void> {
    this.data.push(...attachments)
  }

  async deleteMany(attachments: AnswerAttachment[]): Promise<void> {
    const answerAttachments = this.data.filter((item) => {
      return !attachments.some((attachment) => attachment.equals(item))
    })

    this.data = answerAttachments
  }

  async findById(id: string): Promise<AnswerAttachment | null> {
    return (
      this.data.find(
        (answerAttachment) => answerAttachment.id.toString() === id,
      ) || null
    )
  }

  async findManyByAnswerId(answerId: string): Promise<AnswerAttachment[]> {
    const answerAttachments = this.data.filter(
      (answer) => answer.answerId.toString() === answerId,
    )

    return answerAttachments
  }

  async deleteManyByAnswerId(answerId: string): Promise<void> {
    this.data = this.data.filter(
      (answerAttachment) => answerAttachment.answerId.toString() !== answerId,
    )
  }
}
