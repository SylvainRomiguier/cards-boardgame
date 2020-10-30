import {
  Collection,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryKey,
  Property,
} from "@mikro-orm/core";
import { Card } from "./Card";
import { Play } from "./Play";

@Entity()
export class Set {
  @PrimaryKey()
  id!: number;

  @Property({ type: "date" })
  createdAt = new Date();

  @Property({ type: "date", onUpdate: () => new Date() })
  updatedAt = new Date();

  @OneToMany({ entity: () => Play, mappedBy: 'set', orphanRemoval: false })
  plays = new Collection<Play>(this);

  @ManyToMany(() => Card, card => card.sets)
  cards = new Collection<Card>(this);
}
