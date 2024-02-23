import { AnswerAttachment } from '@/domain/forum/enterprise/entities/answer-attachment'

export abstract class AnswerAttachmentsRepository {
  abstract createMany: (answerAttachment: AnswerAttachment[]) => Promise<void>
  abstract deleteMany: (answerAttachment: AnswerAttachment[]) => Promise<void>
  abstract findManyByAnswerId: (answerId: string) => Promise<AnswerAttachment[]>
  abstract deleteManyByAnswerId: (answerId: string) => Promise<void>
}
