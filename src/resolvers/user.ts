import { User } from "../entities/User";
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
  UseMiddleware,
} from "type-graphql";
import { MyContext, UserKind } from "src/types";
import argon2 from "argon2";
import { validators, errorsHandler } from "../services";

import { COOKIE_NAME, FORGET_PASSWORD_PREFIX } from "../constants";

import { SendEmail } from "../utils/sendEmail";
import { v4 } from "uuid";
import { isAuth } from "../middleware/isAuth";
import { isAdmin } from "../middleware/isAdmin";
import { Staff } from "../entities/Staff";
import { Player } from "../entities/Player";

type PlayerOrStaffResponse = Player | Staff | undefined;

@InputType()
export class NamePasswordInput {
  @Field()
  name!: string;
  @Field()
  password!: string;
}

@ObjectType()
export class FieldError {
  @Field()
  field: string;
  @Field()
  message: string;
}

@InputType()
export class UserInput {
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
export class UserUpdate {
  @Field({ nullable: true })
  name?: string;
  @Field({ nullable: true })
  email?: string;
  @Field({ nullable: true })
  password?: string;
  @Field({ nullable: true })
  avatar?: string;
}

@ObjectType()
export class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];
  @Field(() => User, { nullable: true })
  user?: User;
  @Field(() => Player, { nullable: true })
  player?: Player;
  @Field(() => Staff, { nullable: true })
  staff?: Staff;
}

@Resolver()
export class UserResolver {
  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg("email") email: string,
    @Ctx() { redis }: MyContext
  ) {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return false;
    }

    const token = v4();
    await redis.set(
      `${FORGET_PASSWORD_PREFIX}${token}`,
      user.id,
      "ex",
      1000 * 60 * 10
    ); // 10 minutes expiration token to change the password

    await SendEmail({
      to: user.email,
      subject: "Change your password",
      contentHTML: `<a href='http://localhost:3000/change-password/${token}'>reset password</a>`,
    });

    return true;
  }

  @Mutation(() => UserResponse)
  async changePassword(
    @Arg("token") token: string,
    @Arg("newPassword") newPassword: string,
    @Ctx() { redis }: MyContext
  ) {
    const key = `${FORGET_PASSWORD_PREFIX}${token}`;
    const userId = await redis.get(key);

    const passwordErrors = validators.passwordValidate(newPassword);
    if (passwordErrors.length > 0)
      return errorsHandler("newPassword", passwordErrors.join(", "));

    if (userId === null) {
      return errorsHandler("newPassword", "Token has expired.");
    } else {
      const id = parseInt(userId);
      const user = User.findOne({ where: { id } });
      if (user) {
        await User.update({ id }, { password: await argon2.hash(newPassword) });
        await redis.del(key);
        return { user };
      } else {
        return errorsHandler("newPassword", "Unknown user.");
      }
    }
  }

  @Query(() => User, { nullable: true })
  @UseMiddleware(isAuth)
  me(@Ctx() { req }: MyContext): Promise<PlayerOrStaffResponse> {
    if (req.session!.kind === "Player") {
      return Player.findOne({ where: { id: req.session!.userId } });
    } else {
      return Staff.findOne({ where: { id: req.session!.userId } });
    }
  }

  @Query(() => [User])
  @UseMiddleware(isAuth)
  @UseMiddleware(isAdmin)
  users(): Promise<User[]> {
    return User.find();
  }

  @Query(() => User)
  @UseMiddleware(isAuth)
  @UseMiddleware(isAdmin)
  async user(@Arg("id", () => Int) id: number): Promise<PlayerOrStaffResponse> {
    const user = await User.findOne({ where: { id } });
    if (!user) {
      return undefined;
    } else {
      if (user.kind === "Player") {
        return Player.findOne({ where: { user } });
      } else {
        return Staff.findOne({ where: { user } });
      }  
    }
    return undefined;
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg("userFields") userFields: NamePasswordInput,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const user = await User.findOne({
      where: {
        name: userFields.name,
      },
    });
    if (!user) return errorsHandler("userName", "Ce compte n'existe pas.");
    const valid = await argon2.verify(user.password, userFields.password);
    if (!valid) return errorsHandler("password", "Mot de passe invalide.");
    await User.update({ id: user.id }, { lastLogin: new Date() });
    let staff, player;
    switch (user.kind) {
      case "Staff":
        staff = await Staff.findOne({ where: { user: user } });
        break;
      // case "Player"
      default:
        player = await Player.findOne({ where: { user: user } });
    }
    if (staff) {
      req.session!.userId = user.id;
      req.session!.admin = staff.admin;
    }
    if(player?.active) {
      req.session!.userId = user.id;
    }
    return { user, player, staff };
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  logout(@Ctx() { req, res }: MyContext) {
    return new Promise((resolve) =>
      req.session?.destroy((err) => {
        res.clearCookie(COOKIE_NAME);
        resolve(err === null);
      })
    );
  }
}
