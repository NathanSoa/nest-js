import { Either, right } from '@/core/types/either'
import { QuestionRepository } from '@/domain/forum/application/repositories/question-repository'
import { Question } from '@/domain/forum/enterprise/entities/question'
import { Injectable } from '@nestjs/common'

type Params = {
  page: number
}

type Return = Either<
  null,
  {
    questions: Question[]
  }
>

@Injectable()
export class FetchRecentQuestionsUseCase {
  constructor(private questionRepository: QuestionRepository) {}

  async execute({ page }: Params): Promise<Return> {
    const questions = await this.questionRepository.findManyRecent({ page })

    return right({ questions })
  }
}
