import { GetQuestionBySlugUseCase } from './get-question-by-slug'
import { Slug } from '@/domain/forum/enterprise/entities/value-object/slug'

import { InMemoryQuestionRepository } from 'test/repositories/in-memory-question-repository'
import { makeQuestion } from 'test/factory/make-question'
import { InMemoryQuestionAttachmentsRepository } from 'test/repositories/in-memory-question-attachment-respository'
import { InMemoryAttachmentsRepository } from 'test/repositories/in-memory-attachments-repository'
import { InMemoryStudentRepository } from 'test/repositories/in-memory-student-repository'
import { makeStudent } from 'test/factory/make-student'
import { makeAttachment } from 'test/factory/make-attachments'
import { makeQuestionAttachment } from 'test/factory/make-question-attachment'

let inMemoryQuestionRepository: InMemoryQuestionRepository
let inMemoryAttachmentsRepository: InMemoryAttachmentsRepository
let inMemoryStudentsRepository: InMemoryStudentRepository
let inMemoryQuestionAttachmentRepository: InMemoryQuestionAttachmentsRepository
let systemUnderTest: GetQuestionBySlugUseCase

describe('GetQuestionBySlugUseCase', () => {
  beforeAll(() => {
    inMemoryStudentsRepository = new InMemoryStudentRepository()
    inMemoryAttachmentsRepository = new InMemoryAttachmentsRepository()
    inMemoryQuestionAttachmentRepository =
      new InMemoryQuestionAttachmentsRepository()
    inMemoryQuestionRepository = new InMemoryQuestionRepository(
      inMemoryQuestionAttachmentRepository,
      inMemoryAttachmentsRepository,
      inMemoryStudentsRepository,
    )
    systemUnderTest = new GetQuestionBySlugUseCase(inMemoryQuestionRepository)
  })

  beforeEach(() => {
    inMemoryQuestionRepository.reset()
    inMemoryQuestionAttachmentRepository.reset()
    inMemoryAttachmentsRepository.reset()
    inMemoryStudentsRepository.reset()
  })

  it('should be able to get a question by slug', async () => {
    const student = makeStudent({
      name: 'John Doe',
    })

    inMemoryStudentsRepository.data.push(student)

    const newQuestion = makeQuestion({
      title: 'any_title',
      slug: Slug.create('example-slug'),
      authorId: student.id,
    })

    await inMemoryQuestionRepository.create(newQuestion)

    const attachment = makeAttachment({
      title: 'any_attachment',
    })

    inMemoryAttachmentsRepository.data.push(attachment)

    inMemoryQuestionAttachmentRepository.data.push(
      makeQuestionAttachment({
        attachmentId: attachment.id,
        questionId: newQuestion.id,
      }),
    )

    const result = await systemUnderTest.execute({
      slug: 'example-slug',
    })

    expect(result.isRight()).toBeTruthy()
    expect(result.value).toMatchObject({
      question: expect.objectContaining({
        title: newQuestion.title,
        author: 'John Doe',
        attachments: [
          expect.objectContaining({
            title: attachment.title,
          }),
        ],
      }),
    })
  })
})
