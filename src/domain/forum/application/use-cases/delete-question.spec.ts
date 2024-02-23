import { DeleteQuestionUseCase } from './delete-question'
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
let systemUnderTest: DeleteQuestionUseCase

describe('DeleteQuestionUseCase', () => {
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
    systemUnderTest = new DeleteQuestionUseCase(inMemoryQuestionRepository)
  })

  beforeEach(() => {
    inMemoryQuestionRepository.reset()
    inMemoryQuestionAttachmentRepository.reset()
  })

  it('should be able to delete a question', async () => {
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
      questionId: 'any_id',
    })

    expect(inMemoryQuestionRepository.data.length).toBe(0)
    expect(inMemoryQuestionAttachmentRepository.data).toHaveLength(0)
  })

  it('should not be able to delete a question from another author', async () => {
    const newQuestion = makeQuestion(
      { authorId: new UniqueEntityID('author1') },
      new UniqueEntityID('any_id'),
    )
    await inMemoryQuestionRepository.create(newQuestion)

    const result = await systemUnderTest.execute({
      authorId: 'author2',
      questionId: 'any_id',
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(NotAllowedError)
  })
})
