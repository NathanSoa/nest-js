import { EditAnswerUseCase } from './edit-answer'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'

import { InMemoryAnswersRepository } from 'test/repositories/in-memory-answer-repository'
import { makeAnswer } from 'test/factory/make-answer'
import { NotAllowedError } from '@/core/errors/not-allowed-error'
import { InMemoryAnswerAttachmentsRepository } from 'test/repositories/in-memory-answer-attachments-repository'
import { makeAnswerAttachment } from 'test/factory/make-answer-attachment'

let inMemoryAnswerAttachmentsRepository: InMemoryAnswerAttachmentsRepository
let inMemoryAnswerRepository: InMemoryAnswersRepository
let systemUnderTest: EditAnswerUseCase

describe('EditAnswerUseCase', () => {
  beforeAll(() => {
    inMemoryAnswerAttachmentsRepository =
      new InMemoryAnswerAttachmentsRepository()
    inMemoryAnswerRepository = new InMemoryAnswersRepository(
      inMemoryAnswerAttachmentsRepository,
    )
    systemUnderTest = new EditAnswerUseCase(
      inMemoryAnswerRepository,
      inMemoryAnswerAttachmentsRepository,
    )
  })

  beforeEach(() => {
    inMemoryAnswerRepository.reset()
    inMemoryAnswerAttachmentsRepository.reset()
  })

  it('should be able to edit a answer', async () => {
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
      answerId: newAnswer.id.toString(),
      content: 'new content',
      attachmentsIds: ['1', '3'],
    })

    expect(inMemoryAnswerRepository.data[0]).toMatchObject({
      content: 'new content',
    })
    expect(
      inMemoryAnswerRepository.data[0].attachments.currentItems,
    ).toHaveLength(2)
    expect(inMemoryAnswerRepository.data[0].attachments.currentItems).toEqual([
      expect.objectContaining({
        answerId: inMemoryAnswerRepository.data[0].id,
        attachmentId: new UniqueEntityID('1'),
      }),
      expect.objectContaining({
        answerId: inMemoryAnswerRepository.data[0].id,
        attachmentId: new UniqueEntityID('3'),
      }),
    ])
  })

  it('should not be able to edit a answer from another author', async () => {
    const newAnswer = makeAnswer(
      { authorId: new UniqueEntityID('author1') },
      new UniqueEntityID('any_id'),
    )
    await inMemoryAnswerRepository.create(newAnswer)

    const result = await systemUnderTest.execute({
      authorId: 'author2',
      answerId: newAnswer.id.toString(),
      content: 'new content',
      attachmentsIds: [],
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(NotAllowedError)
  })

  it('should sync new and removed attachment when editing an answer', async () => {
    const newAnswer = makeAnswer(
      {
        authorId: new UniqueEntityID('author-1'),
      },
      new UniqueEntityID('question-1'),
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

    const result = await systemUnderTest.execute({
      answerId: newAnswer.id.toValue(),
      authorId: 'author-1',
      content: 'Conteúdo teste',
      attachmentsIds: ['1', '3'],
    })

    expect(result.isRight()).toBe(true)
    expect(inMemoryAnswerAttachmentsRepository.data).toHaveLength(2)
    expect(inMemoryAnswerAttachmentsRepository.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          attachmentId: new UniqueEntityID('1'),
        }),
        expect.objectContaining({
          attachmentId: new UniqueEntityID('3'),
        }),
      ]),
    )
  })
})
