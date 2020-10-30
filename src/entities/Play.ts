import { Collection, Entity, ManyToMany, ManyToOne, OneToMany, PrimaryKey, Property } from "@mikro-orm/core";
import { Player } from "./Player";
import { Turn } from "./Turn";
import { Set } from "./Set";

@Entity()
export class Play {

  @PrimaryKey()
  id!: number;

  @Property({type : 'date'})
  createdAt = new Date();

  @Property({type: 'date', onUpdate: () => new Date() })
  updatedAt = new Date();

  @ManyToOne(() => Set)
  set!: Set;

  @ManyToMany(() => Player, player => player.plays)
  players = new Collection<Player>(this);

  @OneToMany(() => Turn, turn => turn.play)
  turns = new Collection<Turn>(this);

}