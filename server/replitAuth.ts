import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import MemoryStore from "memorystore";

// For development, we'll create a simple auth system that redirects to dashboard
const isDevelopment = process.env.NODE_ENV !== 'production';

if (!isDevelopment && !process.env.REPLIT_DOMAINS) {
  throw new Error("Environment variable REPLIT_DOMAINS not provided");
}

const getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const memoryStore = MemoryStore(session);
  const sessionStore = new memoryStore({
    checkPeriod: sessionTtl
  });
  return session({
    secret: process.env.SESSION_SECRET || 'development-secret-change-in-production',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: sessionTtl,
    },
  });
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

// Mock user creation for development
function createMockUser() {
  return {
    id: 1,
    username: "demo@example.com",
    email: "demo@example.com",
    firstName: "Demo",
    lastName: "User",
    profileImageUrl: "https://images.unsplash.com/photo-1494790108755-2616b6e13468?w=150&h=150&fit=crop&crop=face"
  };
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  if (isDevelopment) {
    // Development mode - create simple demo user
    passport.serializeUser((user: any, cb) => cb(null, user));
    passport.deserializeUser((user: any, cb) => cb(null, user));

    app.get("/api/login", async (req, res) => {
      // Create a demo user for development
      const demoUser = createMockUser();

      // Create demo session
      const user = {
        claims: {
          sub: demoUser.id.toString(),
          email: demoUser.email,
          first_name: demoUser.firstName,
          last_name: demoUser.lastName,
          profile_image_url: demoUser.profileImageUrl
        },
        expires_at: Math.floor(Date.now() / 1000) + 86400 // 24 hours
      };

      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ error: "Login failed" });
        }
        res.redirect("/dashboard");
      });
    });

    app.get("/api/logout", (req, res) => {
      req.logout(() => {
        req.session.destroy((err) => {
          if (err) {
            console.error("Session destruction error:", err);
          }
          res.clearCookie('connect.sid'); // Clear session cookie
          res.redirect("/");
        });
      });
    });
  } else {
    // Production mode - use full Replit Auth
    const config = await getOidcConfig();

    const verify: VerifyFunction = async (
      tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
      verified: passport.AuthenticateCallback
    ) => {
      const user = {};
      updateUserSession(user, tokens);
      // User creation handled separately - no database dependency
      verified(null, user);
    };

    for (const domain of process.env.REPLIT_DOMAINS!.split(",")) {
      const strategy = new Strategy(
        {
          name: `replitauth:${domain}`,
          config,
          scope: "openid email profile offline_access",
          callbackURL: `https://${domain}/api/callback`,
        },
        verify,
      );
      passport.use(strategy);
    }

    passport.serializeUser((user: Express.User, cb) => cb(null, user));
    passport.deserializeUser((user: Express.User, cb) => cb(null, user));

    app.get("/api/login", (req, res, next) => {
      passport.authenticate(`replitauth:${req.hostname}`, {
        prompt: "login consent",
        scope: ["openid", "email", "profile", "offline_access"],
      })(req, res, next);
    });

    app.get("/api/callback", (req, res, next) => {
      passport.authenticate(`replitauth:${req.hostname}`, {
        successReturnToOrRedirect: "/dashboard",
        failureRedirect: "/api/login",
      })(req, res, next);
    });

    app.get("/api/logout", (req, res) => {
      req.logout(() => {
        res.redirect(
          client.buildEndSessionUrl(config, {
            client_id: process.env.REPL_ID!,
            post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
          }).href
        );
      });
    });
  }
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const user = req.user as any;

  if (!req.isAuthenticated() || !user.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (isDevelopment) {
    // In development, just check if user exists and hasn't expired
    const now = Math.floor(Date.now() / 1000);
    if (now <= user.expires_at) {
      return next();
    } else {
      return res.status(401).json({ message: "Unauthorized" });
    }
  }

  // Production token refresh logic
  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    return next();
  }

  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};