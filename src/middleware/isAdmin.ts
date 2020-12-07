import { MyContext } from "../types";
import { MiddlewareFn } from "type-graphql";

export const isAdmin: MiddlewareFn<MyContext> = ({context}, next) => {
 if(!context.req.session?.admin) {
     throw new Error("not admin");
 }

 return next();
}