import { Entity } from '@/core/entities/entity'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'

type Props = {
  name: string
}

export class Instructor extends Entity<Props> {
  get name() {
    return this.props.name
  }

  static create(props: Props, id?: UniqueEntityID) {
    const instructor = new Instructor(props, id)

    return instructor
  }
}
