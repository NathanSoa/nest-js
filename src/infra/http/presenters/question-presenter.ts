import { Question } from '@/domain/forum/enterprise/entities/question'

export class QuestionPresenter {
  static toHTTP(raw: Question) {
    return {
      id: raw.id.toString(),
      title: raw.title,
      slug: raw.slug.value,
      bestAnswerId: raw.bestAnswerId?.toString(),
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    }
  }
}
