import { Player } from "../entities/Player";
import {
  Arg,
  Ctx,
  Int,
  Mutation,
  Resolver,
  UseMiddleware,
} from "type-graphql";
import argon2 from "argon2";
import { validators, errorsHandler } from "../services";

import { ACTIVATE_ACCOUNT_PREFIX } from "../constants";

import { SendEmail } from "../utils/sendEmail";
import { v4 } from "uuid";

import { UserInput, UserResponse } from "./user";

import { isAuth } from "../middleware/isAuth";
import { isAdmin } from "../middleware/isAdmin";
import { MyContext } from "src/types";

const isUserResponse = (instance : any): instance is UserResponse => {
  if(instance.errors) return true;
  return false;
};

@Resolver()
export class PlayerResolver {
  @Mutation(() => UserResponse)
  async createPlayer(
    @Arg("userFields") userFields: UserInput,
    @Ctx() { redis }: MyContext
  ): Promise<UserResponse> {
    let player = undefined;
    const userInstance = await Player.checkUser(userFields, "Player");
    if(isUserResponse(userInstance)) return userInstance as UserResponse;
    try {
      player = await Player.create({ active: false, ...userInstance }).save();
    } catch (err) {
      return errorsHandler("userName", err.detail ? err.detail : err);
    }

    const token = v4();
    await redis.set(
      `${ACTIVATE_ACCOUNT_PREFIX}${token}`,
      player.id,
      "ex",
      1000 * 60 * 10
    ); // 10 minutes expiration token to change the password

    await SendEmail({
      to: player.email,
      subject: "Change your password",
      contentHTML: `<a href='http://localhost:3000/activate-account/${token}'>Activate my account</a>`,
    });

    return { user: player.user, player };
  }

  @Mutation(() => Boolean)
  async activatePlayer(
    @Arg("token") token: string,
    @Ctx() { redis }: MyContext
  ): Promise<Boolean> {
    const key = `${ACTIVATE_ACCOUNT_PREFIX}${token}`;
    const userId = await redis.get(key);

    if(!userId) return false;

    const userIdNum = parseInt(userId);
    const user = await Player.findOne({ where: { id: userIdNum } });
    if(!user) return false;

    const player = await Player.update({ user }, {active: true});
    if(!player) return false;
    return true;
  }

  @Mutation(() => UserResponse)
  @UseMiddleware(isAuth)
  @UseMiddleware(isAdmin)
  async updateStaff(
    @Arg("id", () => Int) id: number,
    @Arg("userFields") userFields: UserInput,
    @Arg("active") active: boolean
  ): Promise<UserResponse> {
    const user = await Player.findOne({ where: { id } });
    if (!user) return errorsHandler("userName", "this user dos not exists.");
    if (typeof userFields.name !== "undefined") user.name = userFields.name;
    if (typeof userFields.email !== "undefined") user.email = userFields.email;
    if (typeof userFields.password !== "undefined")
      user.password = userFields.password;
    if (typeof userFields.avatar !== "undefined")
      user.avatar = userFields.avatar;
    let updatedUser = await Player.updateUser(id, user);
    if (!updatedUser)
      return errorsHandler("userName", "problem during update.");
    return { player: (await Player.update({ id }, { active, user })).raw };
  }
}
