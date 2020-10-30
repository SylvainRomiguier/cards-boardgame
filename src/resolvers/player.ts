import { Player } from "../entities/Player";
import { Arg, Ctx, Int, Mutation, Query, Resolver } from "type-graphql";
import { MyContext } from "src/types";

@Resolver()
export class PlayerResolver {
  @Query(() => [Player])
  Players(@Ctx() { em }: MyContext): Promise<Player[]> {
    return em.find(Player, {});
  }

  @Query(() => Player, { nullable: true })
  Player(
    @Arg("id", () => Int) id: number,
    @Ctx() { em }: MyContext
  ): Promise<Player | null> {
    return em.findOne(Player, { id });
  }

  @Mutation(() => Player)
  async createPlayer(
    @Arg("name") name: string,
    @Arg("email") email: string,
    @Arg("password") password: string,
    @Ctx() { em }: MyContext,
    @Arg("avatar", {nullable: true}) avatar?: string
  ): Promise<Player | null> {
    const player = em.create(Player, { name, email, password, avatar: avatar ? avatar : null, rank: 1 });
    await em.persistAndFlush(player);
    return player;
  }

  @Mutation(() => Player, { nullable: true })
  async updatePlayer(
    @Arg("id", () => Int) id: number,
    @Ctx() { em }: MyContext,
    @Arg("name", {nullable: true}) name?: string,
    @Arg("email", {nullable: true}) email?: string,
    @Arg("password", {nullable: true}) password?: string,
    @Arg("avatar", {nullable: true}) avatar?: string
  ): Promise<Player | null> {
    const player = await em.findOne(Player, { id });
    if (!player) return null;
    if (typeof name !== "undefined") player.name = name;
    if (typeof email !== "undefined") player.email = email;
    if (typeof password !== "undefined") player.password = password;
    if (typeof avatar !== "undefined") player.avatar = avatar;
    await em.persistAndFlush(player);
    return player;
  }

  @Mutation(() => Boolean)
  async removePlayer(
    @Arg("id", () => Int) id: number,
    @Ctx() { em }: MyContext
  ): Promise<boolean> {
    em.nativeDelete(Player, { id });
    return true;
  }
}
