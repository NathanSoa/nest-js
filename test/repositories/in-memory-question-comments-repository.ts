import { PaginationParams } from '@/core/repositories/pagination-params'
import { InMemoryBaseRepository } from './in-memory-base-repository'
import { QuestionCommentsRepository } from '@/domain/forum/application/repositories/question-comments-repository'
import { QuestionComment } from '@/domain/forum/enterprise/entities/question-comment'
import { CommentWithAuthor } from '@/domain/forum/enterprise/entities/value-object/comment-with-author'
import { InMemoryStudentRepository } from './in-memory-student-repository'

export class InMemoryQuestionCommentsRepository
  extends InMemoryBaseRepository<QuestionComment>
  implements QuestionCommentsRepository
{
  constructor(private studentRepository: InMemoryStudentRepository) {
    super()
  }

  async findById(id: string): Promise<QuestionComment | null> {
    return (
      this.data.find(
        (questionComment) => questionComment.id.toString() === id,
      ) || null
    )
  }

  async findManyByQuestionId(
    questionId: string,
    { page }: PaginationParams,
  ): Promise<QuestionComment[]> {
    const questionComments = this.data
      .filter((answer) => answer.questionId.toString() === questionId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice((page - 1) * 20, page * 20)

    return questionComments
  }

  async findManyByQuestionIdWithAuthor(
    questionId: string,
    { page }: PaginationParams,
  ): Promise<CommentWithAuthor[]> {
    const questionComments = this.data
      .filter((answer) => answer.questionId.toString() === questionId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice((page - 1) * 20, page * 20)
      .map((comment) => {
        const author = this.studentRepository.data.find((student) =>
          student.id.equals(comment.authorId),
        )

        if (!author)
          throw new Error(
            `Author with id ${comment.authorId.toString()} not found`,
          )

        return CommentWithAuthor.create({
          content: comment.content,
          createdAt: comment.createdAt,
          authorId: comment.authorId,
          updatedAt: comment.updatedAt,
          commentId: comment.id,
          author: author.name,
        })
      })

    return questionComments
  }

  async delete(questionComment: QuestionComment): Promise<void> {
    this.data = this.data.filter((item) => item.id !== questionComment.id)
  }

  async create(question: QuestionComment): Promise<void> {
    this.data.push(question)
  }
}
