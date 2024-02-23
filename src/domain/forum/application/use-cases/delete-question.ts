import { Either, left, right } from '@/core/types/either'
import { QuestionRepository } from '@/domain/forum/application/repositories/question-repository'
import { NotAllowedError } from '@/core/errors/not-allowed-error'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { Injectable } from '@nestjs/common'

type Params = {
  questionId: string
  authorId: string
}

type Return = Either<ResourceNotFoundError | NotAllowedError, null>

@Injectable()
export class DeleteQuestionUseCase {
  constructor(private questionRepository: QuestionRepository) {}

  async execute({ questionId, authorId }: Params): Promise<Return> {
    const question = await this.questionRepository.findById(questionId)

    if (!question) {
      return left(new ResourceNotFoundError())
    }

    if (question.authorId.toString() !== authorId) {
      return left(new NotAllowedError())
    }

    await this.questionRepository.delete(question)

    return right(null)
  }
}
