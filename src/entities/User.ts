import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
} from "typeorm";
import { ObjectType, Field, Int } from "type-graphql";
import argon2 from "argon2";
import { UserInput, UserResponse, UserUpdate } from "../resolvers/user";
import errorsHandler from "../services/errorsHandler";
import validators from "../services/validators/validators";
import { UserKind } from "../types";

export interface FormattedUser {
  name: string;
  email: string;
  password: string;
  lastLogin: Date;
  avatar?: string;
  kind: UserKind;
}

@ObjectType()
@Entity()
export class User extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field(() => String)
  @Column()
  kind!: UserKind;

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;

  @Field(() => String)
  @Column({ type: "timestamp" })
  lastLogin: Date;

  @Field()
  @Column({ unique: true })
  name!: string;

  @Field()
  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  avatar?: string;

  static async checkUser(
    userFields: UserInput,
    kind: UserKind
  ): Promise<FormattedUser | UserResponse> {
    const hashedPassword = await argon2.hash(userFields.password);
    const userNameErrors = validators.nameValidate(userFields.name);
    const passwordErrors = validators.passwordValidate(userFields.password);
    const emailErrors = validators.emailValidate(userFields.email);
    if (userNameErrors.length > 0)
      return errorsHandler("userName", userNameErrors.join(", "));
    if (passwordErrors.length > 0)
      return errorsHandler("password", passwordErrors.join(", "));
    if (emailErrors.length > 0)
      return errorsHandler("email", emailErrors.join(", "));
    return ({
        name: userFields.name,
        email: userFields.email,
        password: hashedPassword,
        lastLogin: new Date(),
        avatar: userFields.avatar ? userFields.avatar : undefined,
        kind: kind,
      });
  }

  static async updateUser(
    id: number,
    userFields: UserUpdate
  ): Promise<User | undefined> {
    const user = await User.findOne({ where: { id } });
    if (!user) return undefined;
    if (typeof userFields.name !== "undefined") user.name = userFields.name;
    if (typeof userFields.email !== "undefined") user.email = userFields.email;
    if (typeof userFields.password !== "undefined")
      user.password = userFields.password;
    if (typeof userFields.avatar !== "undefined")
      user.avatar = userFields.avatar;
    return (await User.update({ id }, user)).raw;
  }

  async removeUser(id: number): Promise<boolean> {
    User.delete({ id });
    return true;
  }
}
