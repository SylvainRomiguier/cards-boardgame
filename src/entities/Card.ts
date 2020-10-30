import {  Collection, Entity, ManyToMany, PrimaryKey, Property } from "@mikro-orm/core";
import {Set} from './Set';

@Entity()
export class Card {

  @PrimaryKey()
  id!: number;

  @Property({type : 'date'})
  createdAt = new Date();

  @Property({type: 'date', onUpdate: () => new Date() })
  updatedAt = new Date();

  @Property({type : 'text'})
  title!: string;

  @Property({type : 'text'})
  text!: string;

  @Property()
  value!: number;

  @Property({type : 'text'})
  picture!: string;

  @ManyToMany(() => Set, 'cards', { owner: true })
  sets = new Collection<Set>(this);

}