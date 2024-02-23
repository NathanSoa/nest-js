import { FetchQuestionCommentsUseCase } from './fetch-question-comments'

import { InMemoryQuestionCommentsRepository } from 'test/repositories/in-memory-question-comments-repository'
import { makeQuestionComment } from 'test/factory/make-question-comment'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { InMemoryStudentRepository } from 'test/repositories/in-memory-student-repository'
import { makeStudent } from 'test/factory/make-student'

let inMemoryStudentsRepository: InMemoryStudentRepository
let inMemoryQuestionCommentRepository: InMemoryQuestionCommentsRepository
let systemUnderTest: FetchQuestionCommentsUseCase

describe('Fetch Question Comments', () => {
  beforeAll(() => {
    inMemoryStudentsRepository = new InMemoryStudentRepository()
    inMemoryQuestionCommentRepository = new InMemoryQuestionCommentsRepository(
      inMemoryStudentsRepository,
    )
    systemUnderTest = new FetchQuestionCommentsUseCase(
      inMemoryQuestionCommentRepository,
    )
  })

  beforeEach(() => {
    inMemoryQuestionCommentRepository.reset()
    inMemoryStudentsRepository.reset()
  })

  it('should be able to fetch question comments', async () => {
    const student = makeStudent({ name: 'John Doe' })

    inMemoryStudentsRepository.data.push(student)

    const comment1 = makeQuestionComment({
      questionId: new UniqueEntityID('2345'),
      authorId: student.id,
    })

    const comment2 = makeQuestionComment({
      questionId: new UniqueEntityID('2345'),
      authorId: student.id,
    })

    const comment3 = makeQuestionComment({
      questionId: new UniqueEntityID('2345'),
      authorId: student.id,
    })

    await inMemoryQuestionCommentRepository.create(comment1)
    await inMemoryQuestionCommentRepository.create(comment2)
    await inMemoryQuestionCommentRepository.create(comment3)

    const result = await systemUnderTest.execute({
      page: 1,
      questionId: '2345',
    })

    expect(result.isRight()).toBeTruthy()
    expect(result.value?.comments).toHaveLength(3)
    expect(result.value?.comments).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          author: 'John Doe',
          commentId: comment1.id,
        }),
        expect.objectContaining({
          author: 'John Doe',
          commentId: comment2.id,
        }),
        expect.objectContaining({
          author: 'John Doe',
          commentId: comment3.id,
        }),
      ]),
    )
  })

  it('should be able to fetch paginated recent question comments', async () => {
    const student = makeStudent({ name: 'John Doe' })

    inMemoryStudentsRepository.data.push(student)

    for (let i = 0; i < 30; i++) {
      await inMemoryQuestionCommentRepository.create(
        makeQuestionComment({
          questionId: new UniqueEntityID('2345'),
          authorId: student.id,
        }),
      )
    }

    const result = await systemUnderTest.execute({
      page: 2,
      questionId: '2345',
    })

    expect(result.isRight()).toBeTruthy()
    expect(result.value?.comments).toHaveLength(10)
  })
})
