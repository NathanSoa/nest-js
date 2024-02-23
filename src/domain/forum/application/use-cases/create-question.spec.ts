import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { CreateQuestionUseCase } from './create-question'
import { InMemoryQuestionRepository } from 'test/repositories/in-memory-question-repository'
import { InMemoryQuestionAttachmentsRepository } from 'test/repositories/in-memory-question-attachment-respository'
import { InMemoryAttachmentsRepository } from 'test/repositories/in-memory-attachments-repository'
import { InMemoryStudentRepository } from 'test/repositories/in-memory-student-repository'

let inMemoryQuestionRepository: InMemoryQuestionRepository
let inMemoryStudentsRepository: InMemoryStudentRepository
let inMemoryAttachmentsRepository: InMemoryAttachmentsRepository
let inMemoryQuestionAttachmentRepository: InMemoryQuestionAttachmentsRepository
let systemUnderTest: CreateQuestionUseCase

describe('CreateQuestionUseCase', () => {
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
    systemUnderTest = new CreateQuestionUseCase(inMemoryQuestionRepository)
  })

  beforeEach(() => {
    inMemoryQuestionRepository.reset()
    inMemoryQuestionAttachmentRepository.reset()
  })

  it('should be able to create an answer', async () => {
    const result = await systemUnderTest.execute({
      authorId: 'any_id',
      title: 'any_title',
      content: 'any_content',
      attachmentsIds: ['1', '2'],
    })

    expect(result.isRight()).toBeTruthy()
    expect(inMemoryQuestionRepository.data[0]).toEqual(result.value?.question)
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
          attachmentId: new UniqueEntityID('2'),
        }),
      ],
    )
  })

  it('should persist attachments when creating a new question', async () => {
    const result = await systemUnderTest.execute({
      authorId: '1',
      title: 'Nova pergunta',
      content: 'Conteúdo da pergunta',
      attachmentsIds: ['1', '2'],
    })

    expect(result.isRight()).toBe(true)
    expect(inMemoryQuestionAttachmentRepository.data).toHaveLength(2)
    expect(inMemoryQuestionAttachmentRepository.data).toEqual(
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
