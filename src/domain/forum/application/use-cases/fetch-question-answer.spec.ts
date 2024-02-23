import { FetchQuestionAnswersUseCase } from './fetch-question-answers'

import { InMemoryAnswersRepository } from 'test/repositories/in-memory-answer-repository'
import { makeAnswer } from 'test/factory/make-answer'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { InMemoryAnswerAttachmentsRepository } from 'test/repositories/in-memory-answer-attachments-repository'

let inMemoryAnswerAttachmentsRepository: InMemoryAnswerAttachmentsRepository
let inMemoryAnswerRepository: InMemoryAnswersRepository
let systemUnderTest: FetchQuestionAnswersUseCase

describe('FetchQuestionAnswersUseCase', () => {
  beforeAll(() => {
    inMemoryAnswerAttachmentsRepository =
      new InMemoryAnswerAttachmentsRepository()
    inMemoryAnswerRepository = new InMemoryAnswersRepository(
      inMemoryAnswerAttachmentsRepository,
    )
    systemUnderTest = new FetchQuestionAnswersUseCase(inMemoryAnswerRepository)
  })

  beforeEach(() => {
    inMemoryAnswerRepository.reset()
    inMemoryAnswerAttachmentsRepository.reset()
  })

  it('should be able to fetch question answers', async () => {
    await inMemoryAnswerRepository.create(
      makeAnswer({
        questionId: new UniqueEntityID('2345'),
      }),
    )
    await inMemoryAnswerRepository.create(
      makeAnswer({
        questionId: new UniqueEntityID('2345'),
      }),
    )
    await inMemoryAnswerRepository.create(
      makeAnswer({
        questionId: new UniqueEntityID('2345'),
      }),
    )

    const result = await systemUnderTest.execute({
      page: 1,
      questionId: '2345',
    })

    expect(result.isRight()).toBeTruthy()
    expect(result.value?.answers).toHaveLength(3)
  })

  it('should be able to fetch paginated recent questions', async () => {
    for (let i = 0; i < 30; i++) {
      await inMemoryAnswerRepository.create(
        makeAnswer({
          questionId: new UniqueEntityID('2345'),
        }),
      )
    }

    const result = await systemUnderTest.execute({
      page: 2,
      questionId: '2345',
    })

    expect(result.isRight()).toBeTruthy()
    expect(result.value?.answers).toHaveLength(10)
  })
})
