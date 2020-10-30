import { Card } from "../entities/Card";
import { Arg, Ctx, Int, Mutation, Query, Resolver } from "type-graphql";
import { MyContext } from "src/types";

@Resolver()
export class CardResolver {
  @Query(() => [Card])
  cards(@Ctx() { em }: MyContext): Promise<Card[]> {
    return em.find(Card, {});
  }

  @Query(() => Card, { nullable: true })
  card(
    @Arg("id", () => Int) id: number,
    @Ctx() { em }: MyContext
  ): Promise<Card | null> {
    return em.findOne(Card, { id });
  }

  @Mutation(() => Card)
  async createCard(
    @Arg("title") title: string,
    @Arg("description") text: string,
    @Arg("value") value: number,
    @Arg("picture") picture: string,
    @Ctx() { em }: MyContext
  ): Promise<Card | null> {
    const card = em.create(Card, { title, text, value, picture });
    await em.persistAndFlush(card);
    return card;
  }

  @Mutation(() => Card, { nullable: true })
  async updateCard(
    @Arg("id", () => Int) id: number,
    @Arg("title") title: string,
    @Arg("description") text: string,
    @Arg("value") value: number,
    @Arg("picture") picture: string,
    @Ctx() { em }: MyContext
  ): Promise<Card | null> {
    const card = await em.findOne(Card, { id });
    if (!card) return null;
    card.title = title;
    card.text = text;
    card.value = value;
    card.picture = picture;
    await em.persistAndFlush(card);
    return card;
  }

  @Mutation(() => Boolean)
  async removeCard(
    @Arg("id", () => Int) id: number,
    @Ctx() { em }: MyContext
  ): Promise<boolean> {
    em.nativeDelete(Card, {id});
    return true;
  }
}
