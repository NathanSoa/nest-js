import { PaginationParams } from '@/core/repositories/pagination-params'
import { InMemoryBaseRepository } from './in-memory-base-repository'
import { AnswerCommentsRepository } from '@/domain/forum/application/repositories/answer-comments-repository'
import { AnswerComment } from '@/domain/forum/enterprise/entities/answer-comment'
import { InMemoryStudentRepository } from './in-memory-student-repository'
import { CommentWithAuthor } from '@/domain/forum/enterprise/entities/value-object/comment-with-author'

export class InMemoryAnswerCommentsRepository
  extends InMemoryBaseRepository<AnswerComment>
  implements AnswerCommentsRepository
{
  constructor(private studentsRepository: InMemoryStudentRepository) {
    super()
  }

  async findById(id: string): Promise<AnswerComment | null> {
    return (
      this.data.find((answerComment) => answerComment.id.toString() === id) ||
      null
    )
  }

  async findManyByAnswerId(
    answerId: string,
    { page }: PaginationParams,
  ): Promise<AnswerComment[]> {
    const answerComments = this.data
      .filter((answer) => answer.answerId.toString() === answerId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice((page - 1) * 20, page * 20)

    return answerComments
  }

  async findManyByAnswerIdWithAuthor(
    answerId: string,
    { page }: PaginationParams,
  ) {
    const answerComments = this.data
      .filter((item) => item.answerId.toString() === answerId)
      .slice((page - 1) * 20, page * 20)
      .map((comment) => {
        const author = this.studentsRepository.data.find((student) => {
          return student.id.equals(comment.authorId)
        })

        if (!author) {
          throw new Error(
            `Author with ID "${comment.authorId.toString()} not found."`,
          )
        }

        return CommentWithAuthor.create({
          commentId: comment.id,
          content: comment.content,
          createdAt: comment.createdAt,
          updatedAt: comment.updatedAt,
          authorId: comment.authorId,
          author: author.name,
        })
      })

    return answerComments
  }

  async delete(answerComment: AnswerComment): Promise<void> {
    this.data = this.data.filter((item) => item.id !== answerComment.id)
  }

  async create(answer: AnswerComment): Promise<void> {
    this.data.push(answer)
  }
}
