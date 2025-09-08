
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { question, options } = await request.json();

  if (!question || !options || options.length < 2) {
    return NextResponse.json(
      { error: "Please provide a question and at least two options." },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("polls")
    .insert([{ question, options, user_id: user.id }])
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
