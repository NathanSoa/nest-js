import { makeAnswer } from 'test/factory/make-answer'
import { InMemoryAnswersRepository } from 'test/repositories/in-memory-answer-repository'
import { InMemoryAnswerAttachmentsRepository } from 'test/repositories/in-memory-answer-attachments-repository'
import { InMemoryQuestionRepository } from 'test/repositories/in-memory-question-repository'
import { InMemoryQuestionAttachmentsRepository } from 'test/repositories/in-memory-question-attachment-respository'
import {
  Params,
  Return,
  SendNotificationUseCase,
} from '../use-cases/send-notification'
import { InMemoryNotificationRepository } from 'test/repositories/in-memory-notifications-repository'
import { makeQuestion } from 'test/factory/make-question'
import { MockInstance } from 'vitest'
import { waitFor } from 'test/utils/wait-for'
import { OnQuestionBestAnswerChosen } from './on-question-best-answer-chosen'
import { InMemoryAttachmentsRepository } from 'test/repositories/in-memory-attachments-repository'
import { InMemoryStudentRepository } from 'test/repositories/in-memory-student-repository'

let inMemoryQuestionAttachmentRepository: InMemoryQuestionAttachmentsRepository
let inMemoryQuestionRepository: InMemoryQuestionRepository
let inMemoryAnswerRepository: InMemoryAnswersRepository
let inMemoryAnswerAttachmentRepository: InMemoryAnswerAttachmentsRepository
let inMemoryNotificationRepository: InMemoryNotificationRepository
let inMemoryStudentsRepository: InMemoryStudentRepository
let inMemoryAttachmentsRepository: InMemoryAttachmentsRepository
let sendNotificationUseCase: SendNotificationUseCase

let sendNotifcationExecuteSpy: MockInstance<[Params], Promise<Return>>

describe('OnQuestionBestAnswerChosenCreated', () => {
  beforeAll(() => {
    inMemoryStudentsRepository = new InMemoryStudentRepository()
    inMemoryAttachmentsRepository = new InMemoryAttachmentsRepository()
    inMemoryAnswerAttachmentRepository =
      new InMemoryAnswerAttachmentsRepository()
    inMemoryAnswerRepository = new InMemoryAnswersRepository(
      inMemoryAnswerAttachmentRepository,
    )
    inMemoryQuestionAttachmentRepository =
      new InMemoryQuestionAttachmentsRepository()
    inMemoryQuestionRepository = new InMemoryQuestionRepository(
      inMemoryQuestionAttachmentRepository,
      inMemoryAttachmentsRepository,
      inMemoryStudentsRepository,
    )
    inMemoryNotificationRepository = new InMemoryNotificationRepository()
    sendNotificationUseCase = new SendNotificationUseCase(
      inMemoryNotificationRepository,
    )
  })

  beforeEach(() => {
    sendNotifcationExecuteSpy = vi.spyOn(sendNotificationUseCase, 'execute')

    new OnQuestionBestAnswerChosen(
      inMemoryAnswerRepository,
      sendNotificationUseCase,
    )
  })

  it('should send a notification when question has new best answer chosen', async () => {
    const question = makeQuestion()
    const answer = makeAnswer({ questionId: question.id })

    await inMemoryQuestionRepository.create(question)
    await inMemoryAnswerRepository.create(answer)

    question.bestAnswerId = answer.id

    await inMemoryQuestionRepository.save(question)

    await waitFor(() => {
      expect(sendNotifcationExecuteSpy).toHaveBeenCalled()
    })
  })
})
