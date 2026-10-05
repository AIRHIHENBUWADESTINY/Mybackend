import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return json({ error: "Missing authorization header." }, 401);
    }

    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const {
      data: { user },
      error: userError,
    } = await supabaseUser.auth.getUser();

    if (userError || !user) {
      return json({ error: "Not authenticated." }, 401);
    }

    const { fullName, email, password, dateOfBirth } = await req.json();

    const name = typeof fullName === "string" ? fullName.trim() : "";
    const mail = typeof email === "string" ? email.trim().toLowerCase() : "";
    const dob = typeof dateOfBirth === "string" ? dateOfBirth.trim() : "";

    if (!name) return json({ error: "Name is required." }, 400);
    if (name.length > 120) return json({ error: "Name must be 120 characters or fewer." }, 400);
    if (!EMAIL_REGEX.test(mail)) return json({ error: "Enter a valid email address." }, 400);
    if (dob && !DATE_REGEX.test(dob)) return json({ error: "Enter a valid date of birth." }, 400);
    if (typeof password !== "string" || password.length < 8) {
      return json({ error: "Password must be at least 8 characters long." }, 400);
    }
    if (password.length > 72) {
      return json({ error: "Password must be 72 characters or fewer." }, 400);
    }
    if (mail === user.email?.toLowerCase()) {
      return json({ error: "That is already your own email address." }, 400);
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: mail,
      password,
      email_confirm: true,
      user_metadata: { full_name: name, date_of_birth: dob },
    });

    if (createError) return json({ error: createError.message }, 400);

    const { error: linkError } = await supabaseAdmin
      .from("managed_accounts")
      .insert({
        owner_id: user.id,
        user_id: created.user.id,
        full_name: name,
        email: mail,
      });

    if (linkError) {
      await supabaseAdmin.auth.admin.deleteUser(created.user.id);
      return json({ error: linkError.message }, 500);
    }

    return json({ ok: true, id: created.user.id });
  } catch (error) {
    return json({ error: String(error) }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
