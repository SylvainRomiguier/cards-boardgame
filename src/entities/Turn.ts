import { Entity, ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";
import { Card } from "./Card";
import { Play } from "./Play";
import { Player } from "./Player";

@Entity()
export class Turn {
  @PrimaryKey()
  id!: number;

  @Property({ type: "date" })
  createdAt = new Date();

  @Property({ type: "date", onUpdate: () => new Date() })
  updatedAt = new Date();

  @ManyToOne(() => Play)
  play!: Play;

  @ManyToOne(() => Player)
  player!: Player;

  @ManyToOne(() => Card)
  cardInHand!: Card;
  @ManyToOne(() => Card)
  cardDrafted!: Card;
  @ManyToOne(() => Card)
  cardPlayed!: Card;
 
}
