import { Card } from "../entities/Card";
import { Arg, Int, Mutation, Query, Resolver, UseMiddleware } from "type-graphql";
import { isAuth } from "../middleware/isAuth";
import { isAdmin } from "../middleware/isAdmin";

@Resolver()
export class CardResolver {

  @Query(() => [Card])
  @UseMiddleware(isAuth)
  cards(): Promise<Card[]> {
    return Card.find();
  }

  @Query(() => Card, { nullable: true })
  @UseMiddleware(isAuth)
  card(@Arg("id", () => Int) id: number): Promise<Card | undefined> {
    return Card.findOne({ where: { id } });
  }

  @Mutation(() => Card)
  @UseMiddleware(isAuth)
  @UseMiddleware(isAdmin)
  async createCard(
    @Arg("title") title: string,
    @Arg("description") text: string,
    @Arg("value") value: number,
    @Arg("picture") picture: string
  ): Promise<Card | null> {
    return Card.create({ title, text, value, picture }).save();
  }

  @Mutation(() => Card, { nullable: true })
  @UseMiddleware(isAuth)
  @UseMiddleware(isAdmin)
  async updateCard(
    @Arg("id", () => Int) id: number,
    @Arg("title") title: string,
    @Arg("description") text: string,
    @Arg("value") value: number,
    @Arg("picture") picture: string
  ): Promise<Card | null> {
    const card = await Card.findOne({ where: { id } });
    if (!card) return null;
    await Card.update({ id }, { title, text, value, picture });
    return card;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  @UseMiddleware(isAdmin)
  async removeCard(@Arg("id", () => Int) id: number): Promise<boolean> {
    Card.delete({ id });
    return true;
  }
}
