import { Either, left, right } from '@/core/types/either'
import { AnswerRepository } from '@/domain/forum/application/repositories/answer-repository'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { NotAllowedError } from '@/core/errors/not-allowed-error'
import { Injectable } from '@nestjs/common'

type Params = {
  answerId: string
  authorId: string
}

type Return = Either<ResourceNotFoundError | NotAllowedError, null>

@Injectable()
export class DeleteAnswerUseCase {
  constructor(private answerRepository: AnswerRepository) {}

  async execute({ answerId, authorId }: Params): Promise<Return> {
    const answer = await this.answerRepository.findById(answerId)

    if (!answer) {
      return left(new ResourceNotFoundError())
    }

    if (answer.authorId.toString() !== authorId) {
      return left(new NotAllowedError())
    }

    await this.answerRepository.delete(answer)

    return right(null)
  }
}
