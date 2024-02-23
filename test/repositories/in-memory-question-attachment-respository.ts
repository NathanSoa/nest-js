import { InMemoryBaseRepository } from './in-memory-base-repository'
import { QuestionAttachmentsRepository } from '@/domain/forum/application/repositories/question-attachment-repository'
import { QuestionAttachment } from '@/domain/forum/enterprise/entities/question-attachment'

export class InMemoryQuestionAttachmentsRepository
  extends InMemoryBaseRepository<QuestionAttachment>
  implements QuestionAttachmentsRepository
{
  async createMany(attachments: QuestionAttachment[]): Promise<void> {
    this.data.push(...attachments)
  }

  async deleteMany(attachments: QuestionAttachment[]): Promise<void> {
    this.data = this.data.filter(
      (questionAttachment) =>
        !attachments.some((attachment) =>
          attachment.equals(questionAttachment),
        ),
    )
  }

  async findById(id: string): Promise<QuestionAttachment | null> {
    return (
      this.data.find(
        (questionAttachment) => questionAttachment.id.toString() === id,
      ) || null
    )
  }

  async findManyByQuestionId(
    questionId: string,
  ): Promise<QuestionAttachment[]> {
    const questionAttachments = this.data.filter(
      (answer) => answer.questionId.toString() === questionId,
    )

    return questionAttachments
  }

  async deleteManyByQuestionId(questionId: string): Promise<void> {
    this.data = this.data.filter(
      (questionAttachment) =>
        questionAttachment.questionId.toString() !== questionId,
    )
  }
}
