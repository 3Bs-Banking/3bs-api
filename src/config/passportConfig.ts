import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import Container from "typedi";
import { UserService } from "@/services/UserService";

passport.use(
  new LocalStrategy(async (email, password, done) => {
    try {
      const userService = Container.get(UserService);
      const user = (await userService.find({ email }))[0];

      if (!user) return done(null, false, { message: "User not found" });

      const isValid = await user.validatePassword(password);
      if (!isValid) return done(null, false, { message: "Incorrect password" });

      return done(null, { id: user.id, email: user.email });
    } catch (error) {
      return done(error);
    }
  })
);

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const userService = Container.get(UserService);
    const user = await userService.findById(id);
    done(null, user === null ? null : { id: user.id, email: user.email });
  } catch (error) {
    done(error);
  }
});

export default passport;
