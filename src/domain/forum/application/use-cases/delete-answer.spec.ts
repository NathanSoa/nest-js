import { DeleteAnswerUseCase } from './delete-answer'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'

import { InMemoryAnswersRepository } from 'test/repositories/in-memory-answer-repository'
import { makeAnswer } from 'test/factory/make-answer'
import { NotAllowedError } from '@/core/errors/not-allowed-error'
import { InMemoryAnswerAttachmentsRepository } from 'test/repositories/in-memory-answer-attachments-repository'
import { makeAnswerAttachment } from 'test/factory/make-answer-attachment'

let inMemoryAnswerAttachmentsRepository: InMemoryAnswerAttachmentsRepository
let inMemoryAnswerRepository: InMemoryAnswersRepository
let systemUnderTest: DeleteAnswerUseCase

describe('DeleteAnswerUseCase', () => {
  beforeAll(() => {
    inMemoryAnswerAttachmentsRepository =
      new InMemoryAnswerAttachmentsRepository()
    inMemoryAnswerRepository = new InMemoryAnswersRepository(
      inMemoryAnswerAttachmentsRepository,
    )
    systemUnderTest = new DeleteAnswerUseCase(inMemoryAnswerRepository)
  })

  beforeEach(() => {
    inMemoryAnswerRepository.reset()
    inMemoryAnswerAttachmentsRepository.reset()
  })

  it('should be able to delete a answer', async () => {
    const newAnswer = makeAnswer(
      { authorId: new UniqueEntityID('author1') },
      new UniqueEntityID('any_id'),
    )
    await inMemoryAnswerRepository.create(newAnswer)

    inMemoryAnswerAttachmentsRepository.data.push(
      makeAnswerAttachment({
        answerId: newAnswer.id,
        attachmentId: new UniqueEntityID('1'),
      }),
      makeAnswerAttachment({
        answerId: newAnswer.id,
        attachmentId: new UniqueEntityID('2'),
      }),
    )

    await systemUnderTest.execute({
      authorId: 'author1',
      answerId: 'any_id',
    })

    expect(inMemoryAnswerRepository.data.length).toBe(0)
    expect(inMemoryAnswerAttachmentsRepository.data).toHaveLength(0)
  })

  it('should not be able to delete a answer from another author', async () => {
    const newAnswer = makeAnswer(
      { authorId: new UniqueEntityID('author1') },
      new UniqueEntityID('any_id'),
    )
    await inMemoryAnswerRepository.create(newAnswer)

    const result = await systemUnderTest.execute({
      authorId: 'author2',
      answerId: 'any_id',
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(NotAllowedError)
  })
})
