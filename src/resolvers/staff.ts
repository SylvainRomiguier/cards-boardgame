import { Staff } from "../entities/Staff";
import { Arg, Int, Mutation, Resolver, UseMiddleware } from "type-graphql";
import { errorsHandler } from "../services";

import { UserInput, UserResponse } from "./user";
import { isAuth } from "../middleware/isAuth";
import { isAdmin } from "../middleware/isAdmin";

const isUserResponse = (instance : any): instance is UserResponse => {
  if(instance.errors) return true;
  return false;
};


@Resolver()
export class StaffResolver {
  @Mutation(() => UserResponse)
  @UseMiddleware(isAuth)
  //@UseMiddleware(isAdmin)
  async createStaff(
    @Arg("userFields") userFields: UserInput
  ): Promise<UserResponse> {
    let staff = undefined;
    const userInstance = await Staff.checkUser(userFields, "Staff");
    if(isUserResponse(userInstance)) return userInstance as UserResponse;
    try {
      staff = await Staff.create({ admin: false, ...userInstance }).save();
    } catch (err) {
      return errorsHandler("userName", err.detail ? err.detail : err);
    }

    return { staff };
  }

  @Mutation(() => UserResponse)
  @UseMiddleware(isAuth)
  @UseMiddleware(isAdmin)
  async updateStaff(
    @Arg("id", () => Int) id: number,
    @Arg("userFields") userFields: UserInput,
    @Arg("admin") admin: boolean
  ): Promise<UserResponse> {
    const user = await Staff.findOne({ where: { id } });
    if (!user) return errorsHandler("userName", "this user dos not exists.");
    if (typeof userFields.name !== "undefined") user.name = userFields.name;
    if (typeof userFields.email !== "undefined") user.email = userFields.email;
    if (typeof userFields.password !== "undefined")
      user.password = userFields.password;
    if (typeof userFields.avatar !== "undefined")
      user.avatar = userFields.avatar;
    let updatedUser = await Staff.updateUser(id, user);
    if (!updatedUser)
      return errorsHandler("userName", "problem during update.");
    return { staff: (await Staff.update({ id }, { admin, user })).raw };
  }
}
