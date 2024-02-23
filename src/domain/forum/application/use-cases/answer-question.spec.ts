import { InMemoryAnswersRepository } from 'test/repositories/in-memory-answer-repository'
import { AnswerQuestionUseCase } from './answer-question'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { InMemoryAnswerAttachmentsRepository } from 'test/repositories/in-memory-answer-attachments-repository'

let inMemoryAnswerAttachmentsRepository: InMemoryAnswerAttachmentsRepository
let inMemoryAnswersRepository: InMemoryAnswersRepository
let systemUnderTest: AnswerQuestionUseCase

describe('AnswerQuestionUseCase', () => {
  beforeAll(() => {
    inMemoryAnswerAttachmentsRepository =
      new InMemoryAnswerAttachmentsRepository()
    inMemoryAnswersRepository = new InMemoryAnswersRepository(
      inMemoryAnswerAttachmentsRepository,
    )
    systemUnderTest = new AnswerQuestionUseCase(inMemoryAnswersRepository)
  })

  beforeEach(() => {
    inMemoryAnswersRepository.reset()
    inMemoryAnswerAttachmentsRepository.reset()
  })

  it('should be able to create an answer', async () => {
    const result = await systemUnderTest.execute({
      authorId: 'any_id',
      questionId: 'any_id',
      content: 'any_content',
      attachmentsIds: ['1', '2'],
    })

    expect(result.isRight()).toBeTruthy()
    expect(inMemoryAnswersRepository.data[0]).toEqual(result.value?.answer)
    expect(
      inMemoryAnswersRepository.data[0].attachments.currentItems,
    ).toHaveLength(2)
    expect(inMemoryAnswersRepository.data[0].attachments.currentItems).toEqual([
      expect.objectContaining({
        answerId: inMemoryAnswersRepository.data[0].id,
        attachmentId: new UniqueEntityID('1'),
      }),
      expect.objectContaining({
        answerId: inMemoryAnswersRepository.data[0].id,
        attachmentId: new UniqueEntityID('2'),
      }),
    ])
  })

  it('should persist attachments when creating a new answer', async () => {
    const result = await systemUnderTest.execute({
      questionId: '1',
      authorId: '1',
      content: 'Conteúdo da resposta',
      attachmentsIds: ['1', '2'],
    })

    expect(result.isRight()).toBe(true)
    expect(inMemoryAnswerAttachmentsRepository.data).toHaveLength(2)
    expect(inMemoryAnswerAttachmentsRepository.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          attachmentId: new UniqueEntityID('1'),
        }),
        expect.objectContaining({
          attachmentId: new UniqueEntityID('1'),
        }),
      ]),
    )
  })
})
