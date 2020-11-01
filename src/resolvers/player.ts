import { Player } from "../entities/Player";
import {
  Arg,
  Ctx,
  Field,
  InputType,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from "type-graphql";
import { MyContext } from "src/types";
import argon2 from "argon2";
import { validators, errorsHandler } from "../services";

@InputType()
class UserInput {
  @Field()
  name: string;
  @Field()
  email: string;
  @Field()
  password: string;
  @Field({ nullable: true })
  avatar?: string;
}

@InputType()
class UserUpdate {
  @Field({ nullable: true })
  name?: string;
  @Field({ nullable: true })
  email?: string;
  @Field({ nullable: true })
  password?: string;
  @Field({ nullable: true })
  avatar?: string;
}

@InputType()
class NamePasswordInput {
  @Field()
  name!: string;
  @Field()
  password!: string;
}

@ObjectType()
class FieldError {
  @Field()
  field: string;
  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];
  @Field(() => Player, { nullable: true })
  player?: Player;
}

@Resolver()
export class PlayerResolver {
  @Query(() => Player, { nullable: true })
  me(@Ctx() { em, req }: MyContext): Promise<Player | null> {
    return em.findOne(Player, { id: req.session!.playerId });
  }

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

  @Mutation(() => UserResponse)
  async createPlayer(
    @Arg("playerFields") playerFields: UserInput,
    @Ctx() { em }: MyContext
  ): Promise<UserResponse> {
    const hashedPassword = await argon2.hash(playerFields.password);
    const playerNameErrors = validators.playerNameValidate(playerFields.name);
    const passwordErrors = validators.passwordValidate(playerFields.password);
    if (playerNameErrors.length > 0)
      return errorsHandler("Nom d'utilisateur", playerNameErrors.join(", "));
    if (passwordErrors.length > 0)
      return errorsHandler("Mot de passe", passwordErrors.join(", "));
    const player = em.create(Player, {
      name: playerFields.name,
      email: playerFields.email,
      password: hashedPassword,
      avatar: playerFields.avatar ? playerFields.avatar : null,
      rank: 1,
    });
    try {
      await em.persistAndFlush(player);
    } catch (err) {
      if (err.detail.includes("existe déjà"))
        return errorsHandler(
          "Nom d'utilisateur/Adresse email",
          "Cette valeur existe déjà."
        );
      return errorsHandler("Erreur inconnue", err.detail ? err.detail : err);
    }
    return { player };
  }

  @Mutation(() => Player, { nullable: true })
  async updatePlayer(
    @Arg("id", () => Int) id: number,
    @Arg("playerFields") playerFields: UserUpdate,
    @Ctx() { em }: MyContext
  ): Promise<Player | null> {
    const player = await em.findOne(Player, { id });
    if (!player) return null;
    if (typeof playerFields.name !== "undefined")
      player.name = playerFields.name;
    if (typeof playerFields.email !== "undefined")
      player.email = playerFields.email;
    if (typeof playerFields.password !== "undefined")
      player.password = playerFields.password;
    if (typeof playerFields.avatar !== "undefined")
      player.avatar = playerFields.avatar;
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

  @Mutation(() => UserResponse)
  async login(
    @Arg("playerFields") playerFields: NamePasswordInput,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    const player = await em.findOne(Player, {
      name: playerFields.name,
    });
    if (!player)
      return errorsHandler(
        "nom d'utilisateur",
        "Ce nom d'utilisateur n'existe pas."
      );
    const valid = await argon2.verify(player.password, playerFields.password);
    if (!valid) return errorsHandler("mot de passe", "Mot de passe invalide.");

    req.session!.playerId = player.id;

    return { player };
  }
}
