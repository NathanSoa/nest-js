import { AnswerRepository } from '@/domain/forum/application/repositories/answer-repository'
import { Answer } from '@/domain/forum/enterprise/entities/answer'
import { InMemoryBaseRepository } from './in-memory-base-repository'
import { PaginationParams } from '@/core/repositories/pagination-params'
import { AnswerAttachmentsRepository } from '@/domain/forum/application/repositories/answer-attachments-repository'
import { DomainEvents } from '@/core/events/domain-events'

export class InMemoryAnswersRepository
  extends InMemoryBaseRepository<Answer>
  implements AnswerRepository
{
  constructor(private answerAttachmentRepository: AnswerAttachmentsRepository) {
    super()
  }

  async findManyByQuestionId(
    questionId: string,
    { page }: PaginationParams,
  ): Promise<Answer[]> {
    const answers = this.data
      .filter((answer) => answer.questionId.toString() === questionId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice((page - 1) * 20, page * 20)

    return answers
  }

  async create(answer: Answer): Promise<void> {
    this.data.push(answer)

    await this.answerAttachmentRepository.createMany(
      answer.attachments.getItems(),
    )

    DomainEvents.dispatchEventsForAggregate(answer.id)
  }

  async findById(id: string): Promise<Answer | null> {
    return this.data.find((answer) => answer.id.toString() === id) || null
  }

  async delete(answer: Answer): Promise<void> {
    this.data = this.data.filter((item) => item.id !== answer.id)
    await this.answerAttachmentRepository.deleteManyByAnswerId(
      answer.id.toString(),
    )
  }

  async save(answer: Answer): Promise<void> {
    const itemIndex = this.data.findIndex((item) => item.id === answer.id)
    this.data[itemIndex] = answer

    await this.answerAttachmentRepository.createMany(
      answer.attachments.getNewItems(),
    )

    await this.answerAttachmentRepository.deleteMany(
      answer.attachments.getRemovedItems(),
    )

    DomainEvents.dispatchEventsForAggregate(answer.id)
  }
}
