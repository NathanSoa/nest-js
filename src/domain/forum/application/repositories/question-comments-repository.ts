import { PaginationParams } from '@/core/repositories/pagination-params'
import { QuestionComment } from '@/domain/forum/enterprise/entities/question-comment'
import { CommentWithAuthor } from '../../enterprise/entities/value-object/comment-with-author'

export abstract class QuestionCommentsRepository {
  abstract findById: (id: string) => Promise<QuestionComment | null>
  abstract findManyByQuestionId: (
    questionId: string,
    params: PaginationParams,
  ) => Promise<QuestionComment[]>

  abstract findManyByQuestionIdWithAuthor: (
    questionId: string,
    params: PaginationParams,
  ) => Promise<CommentWithAuthor[]>

  abstract create: (comment: QuestionComment) => Promise<void>
  abstract delete: (comment: QuestionComment) => Promise<void>
}
