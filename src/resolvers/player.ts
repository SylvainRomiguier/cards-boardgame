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
import { ACTIVATE_ACCOUNT_PREFIX, COOKIE_NAME, FORGET_PASSWORD_PREFIX } from "../constants";
import { SendEmail } from "../utils/sendEmail";
import { v4 } from "uuid";

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
  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg("email") email: string,
    @Ctx() { em, redis }: MyContext
  ) {
    const player = await em.findOne(Player, { email });
    if (!player) {
      return false;
    }

    const token = v4();
    await redis.set(
      `${FORGET_PASSWORD_PREFIX}${token}`,
      player.id,
      "ex",
      1000 * 60 * 10
    ); // 10 minutes expiration token to change the password

    await SendEmail({
      to: player.email,
      subject: "Change your password",
      contentHTML: `<a href='http://localhost:3000/change-password/${token}'>reset password</a>`,
    });

    return true;
  }

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
    @Ctx() { em, redis }: MyContext
  ): Promise<UserResponse> {
    const hashedPassword = await argon2.hash(playerFields.password);
    const playerNameErrors = validators.playerNameValidate(playerFields.name);
    const passwordErrors = validators.passwordValidate(playerFields.password);
    const emailErrors = validators.emailValidate(playerFields.email);
    if (playerNameErrors.length > 0)
      return errorsHandler("playerName", playerNameErrors.join(", "));
    if (passwordErrors.length > 0)
      return errorsHandler("password", passwordErrors.join(", "));
    if (emailErrors.length > 0)
      return errorsHandler("email", emailErrors.join(", "));
    const player = em.create(Player, {
      name: playerFields.name,
      email: playerFields.email,
      password: hashedPassword,
      avatar: playerFields.avatar ? playerFields.avatar : null,
      rank: 1,
      active: false,
    });
    try {
      await em.persistAndFlush(player);
    } catch (err) {
      if (err.code === "23505") {
        if (err.constraint === "player_name_unique")
          return errorsHandler("playerName", "Ce nom existe déjà.");
        if (err.constraint === "player_email_unique")
          return errorsHandler("email", "Cet email existe déjà.");
      }
      return errorsHandler("playerName", err.detail ? err.detail : err);
    }
    const token = v4();
    await redis.set(
      `${ACTIVATE_ACCOUNT_PREFIX}${token}`,
      player.id,
      "ex",
      1000 * 60 * 10
    ); // 10 minutes expiration token to activate the account

    await SendEmail({
      to: player.email,
      subject: "Card Board Game, activate your account",
      contentHTML: `<a href='http://localhost:3000/activate-account/${token}'>Yes I want to be a part of it !</a>`,
    });
    
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
      active: true,
    });
    if (!player)
      return errorsHandler(
        "playerName",
        "Ce compte n'existe pas ou n'est pas activé."
      );
    const valid = await argon2.verify(player.password, playerFields.password);
    if (!valid) return errorsHandler("password", "Mot de passe invalide.");
    player.lastLogin = new Date();
    await em.persistAndFlush(player);
    req.session!.playerId = player.id;

    return { player };
  }

  @Mutation(() => Boolean)
  logout(@Ctx() { req, res }: MyContext) {
    return new Promise((resolve) =>
      req.session?.destroy((err) => {
        res.clearCookie(COOKIE_NAME);
        resolve(err === null);
      })
    );
  }
}
