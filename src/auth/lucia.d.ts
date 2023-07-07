// lucia.d.ts
/// <reference types="lucia" />
declare namespace Lucia {
  type Auth = import("./src/auth/lucia.server.js").Auth;
  type DatabaseUserAttributes = {
    email: string;
    name: string;
  };
  type DatabaseSessionAttributes = {}; // new
}
