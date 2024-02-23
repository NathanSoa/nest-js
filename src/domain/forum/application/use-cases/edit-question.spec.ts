import { EditQuestionUseCase } from './edit-question'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'

import { InMemoryQuestionRepository } from 'test/repositories/in-memory-question-repository'
import { makeQuestion } from 'test/factory/make-question'
import { NotAllowedError } from '@/core/errors/not-allowed-error'
import { InMemoryQuestionAttachmentsRepository } from 'test/repositories/in-memory-question-attachment-respository'
import { makeQuestionAttachment } from 'test/factory/make-question-attachment'
import { InMemoryAttachmentsRepository } from 'test/repositories/in-memory-attachments-repository'
import { InMemoryStudentRepository } from 'test/repositories/in-memory-student-repository'

let inMemoryQuestionRepository: InMemoryQuestionRepository
let inMemoryQuestionAttachmentRepository: InMemoryQuestionAttachmentsRepository
let inMemoryStudentsRepository: InMemoryStudentRepository
let inMemoryAttachmentsRepository: InMemoryAttachmentsRepository
let systemUnderTest: EditQuestionUseCase

describe('EditQuestionUseCase', () => {
  beforeAll(() => {
    inMemoryAttachmentsRepository = new InMemoryAttachmentsRepository()
    inMemoryStudentsRepository = new InMemoryStudentRepository()
    inMemoryQuestionAttachmentRepository =
      new InMemoryQuestionAttachmentsRepository()
    inMemoryQuestionRepository = new InMemoryQuestionRepository(
      inMemoryQuestionAttachmentRepository,
      inMemoryAttachmentsRepository,
      inMemoryStudentsRepository,
    )
    systemUnderTest = new EditQuestionUseCase(
      inMemoryQuestionRepository,
      inMemoryQuestionAttachmentRepository,
    )
  })

  beforeEach(() => {
    inMemoryQuestionRepository.reset()
    inMemoryQuestionAttachmentRepository.reset()
  })

  it('should be able to edit a question', async () => {
    const newQuestion = makeQuestion(
      { authorId: new UniqueEntityID('author1') },
      new UniqueEntityID('any_id'),
    )
    await inMemoryQuestionRepository.create(newQuestion)

    inMemoryQuestionAttachmentRepository.data.push(
      makeQuestionAttachment({
        questionId: newQuestion.id,
        attachmentId: new UniqueEntityID('1'),
      }),
      makeQuestionAttachment({
        questionId: newQuestion.id,
        attachmentId: new UniqueEntityID('2'),
      }),
    )

    await systemUnderTest.execute({
      authorId: 'author1',
      questionId: newQuestion.id.toString(),
      content: 'new content',
      title: 'new title',
      attachmentIds: ['1', '3'],
    })

    expect(inMemoryQuestionRepository.data[0]).toMatchObject({
      content: 'new content',
      title: 'new title',
    })
    expect(
      inMemoryQuestionRepository.data[0].attachments.currentItems,
    ).toHaveLength(2)
    expect(inMemoryQuestionRepository.data[0].attachments.currentItems).toEqual(
      [
        expect.objectContaining({
          questionId: inMemoryQuestionRepository.data[0].id,
          attachmentId: new UniqueEntityID('1'),
        }),
        expect.objectContaining({
          questionId: inMemoryQuestionRepository.data[0].id,
          attachmentId: new UniqueEntityID('3'),
        }),
      ],
    )
  })

  it('should not be able to edit a question from another author', async () => {
    const newQuestion = makeQuestion(
      { authorId: new UniqueEntityID('author1') },
      new UniqueEntityID('any_id'),
    )
    await inMemoryQuestionRepository.create(newQuestion)

    const result = await systemUnderTest.execute({
      authorId: 'author2',
      questionId: newQuestion.id.toString(),
      content: 'new content',
      title: 'new title',
      attachmentIds: [],
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(NotAllowedError)
  })

  it('should sync new and removed attachment when editing a question', async () => {
    const newQuestion = makeQuestion(
      {
        authorId: new UniqueEntityID('author-1'),
      },
      new UniqueEntityID('question-1'),
    )

    await inMemoryQuestionRepository.create(newQuestion)

    inMemoryQuestionAttachmentRepository.data.push(
      makeQuestionAttachment({
        questionId: newQuestion.id,
        attachmentId: new UniqueEntityID('1'),
      }),
      makeQuestionAttachment({
        questionId: newQuestion.id,
        attachmentId: new UniqueEntityID('2'),
      }),
    )

    const result = await systemUnderTest.execute({
      questionId: newQuestion.id.toValue(),
      authorId: 'author-1',
      title: 'Pergunta teste',
      content: 'Conteúdo teste',
      attachmentIds: ['1', '3'],
    })

    expect(result.isRight()).toBe(true)
    expect(inMemoryQuestionAttachmentRepository.data).toHaveLength(2)
    expect(inMemoryQuestionAttachmentRepository.data).toEqual(
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
