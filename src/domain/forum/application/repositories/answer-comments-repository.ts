import { PaginationParams } from '@/core/repositories/pagination-params'
import { AnswerComment } from '@/domain/forum/enterprise/entities/answer-comment'
import { CommentWithAuthor } from '../../enterprise/entities/value-object/comment-with-author'

export abstract class AnswerCommentsRepository {
  abstract findById: (id: string) => Promise<AnswerComment | null>
  abstract findManyByAnswerId: (
    answerId: string,
    params: PaginationParams,
  ) => Promise<AnswerComment[]>

  abstract findManyByAnswerIdWithAuthor: (
    answerId: string,
    params: PaginationParams,
  ) => Promise<CommentWithAuthor[]>

  abstract create: (comment: AnswerComment) => Promise<void>
  abstract delete: (comment: AnswerComment) => Promise<void>
}
