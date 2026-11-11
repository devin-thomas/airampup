type Inquiry = {
  readonly name: string;
  readonly email: string;
  readonly help: string;
  readonly scope: string;
};
type EmailBinding = {
  send(message: {
    from: string;
    to: string;
    replyTo: string;
    subject: string;
    text: string;
  }): Promise<unknown>;
};
type RateLimit = {
  limit(options: { key: string }): Promise<{ success: boolean }>;
};
type Env = { EMAIL: EmailBinding; RATE_LIMITER: RateLimit };
const scopes: readonly string[] = [
  "One-hour session",
  "More time or detailed onboarding",
  "Team onboarding",
  "Not sure yet",
];
function parseInquiry(value: unknown): Inquiry | undefined {
  if (typeof value !== "object" || value === null) return undefined;
  const fields: Record<string, unknown> = Object.fromEntries(
    Object.entries(value),
  );
  const { name, email, help, scope } = fields;
  if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof help !== "string" ||
    typeof scope !== "string"
  )
    return undefined;
  if (
    name.length < 1 ||
    name.length > 100 ||
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    help.length < 1 ||
    help.length > 3000 ||
    !scopes.includes(scope)
  )
    return undefined;
  if (/[\r\n]/.test(name) || /[\r\n]/.test(email)) return undefined;
  return { name, email, help, scope };
}
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (
      request.method !== "POST" ||
      new URL(request.url).pathname !== "/api/inquiry"
    )
      return new Response("Not found", { status: 404 });
    if (request.headers.get("origin") !== "https://airampup.pages.dev")
      return new Response("Forbidden", { status: 403 });
    if (Number(request.headers.get("content-length") ?? "0") > 6000)
      return new Response("Too large", { status: 413 });
    const ip: string = request.headers.get("cf-connecting-ip") ?? "unknown";
    const allowed: { success: boolean } = await env.RATE_LIMITER.limit({
      key: ip,
    });
    if (!allowed.success)
      return new Response("Too many requests", { status: 429 });
    let input: unknown;
    try {
      input = await request.json();
    } catch {
      return new Response("Invalid request", { status: 400 });
    }
    const inquiry: Inquiry | undefined = parseInquiry(input);
    if (inquiry === undefined)
      return new Response("Invalid request", { status: 400 });
    try {
      await env.EMAIL.send({
        from: "inquiries@mail-rampup.uppercut-labs.com",
        to: "rampup@uppercut-labs.com",
        replyTo: inquiry.email,
        subject: `AI Ramp Up inquiry: ${inquiry.scope}`,
        text: `Name: ${inquiry.name}\nEmail: ${inquiry.email}\nInterest: ${inquiry.scope}\n\n${inquiry.help}`,
      });
      return Response.json({ ok: true });
    } catch (error: unknown) {
      console.error("Inquiry delivery failed", error);
      return new Response("Delivery failed", { status: 502 });
    }
  },
};
