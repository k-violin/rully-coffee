import { createServerFn, createServerOnlyFn } from "@tanstack/react-start";
import { useSession } from "@tanstack/react-start/server";

type AdminSession = { admin?: boolean };

function sessionConfig() {
  const password = process.env["ADMIN_SESSION_SECRET"];
  if (!password || password.length < 32) {
    throw new Error("ADMIN_SESSION_SECRET must be at least 32 characters.");
  }
  return {
    password,
    name: "rully-admin",
    maxAge: 60 * 60 * 12,
    cookie: {
      httpOnly: true,
      sameSite: "lax" as const,
      path: "/",
      secure: process.env["NODE_ENV"] === "production",
    },
  };
}

function matches(input: string, expected: string) {
  const left = new TextEncoder().encode(input);
  const right = new TextEncoder().encode(expected);
  if (left.length !== right.length) return false;
  let diff = 0;
  for (let i = 0; i < left.length; i++) diff |= left[i]! ^ right[i]!;
  return diff === 0;
}

export const readAdminSession = createServerOnlyFn(async () => {
  const session = await useSession<AdminSession>(sessionConfig());
  return session.data.admin === true;
});

export const getAdminSession = createServerFn({ method: "GET" }).handler(async () => {
  return { ok: await readAdminSession() };
});

export const adminLogin = createServerFn({ method: "POST" })
  .validator((data: { id: string; password: string }) => data)
  .handler(async ({ data }) => {
    const id = process.env["ADMIN_ID"];
    const password = process.env["ADMIN_PASSWORD"];
    if (!id || !password) return { ok: false as const };
    if (!matches(data.id.trim(), id) || !matches(data.password, password)) return { ok: false as const };
    const session = await useSession<AdminSession>(sessionConfig());
    await session.update({ admin: true });
    return { ok: true as const };
  });

export const adminLogout = createServerFn({ method: "POST" }).handler(async () => {
  const session = await useSession<AdminSession>(sessionConfig());
  await session.clear();
  return { ok: true as const };
});
