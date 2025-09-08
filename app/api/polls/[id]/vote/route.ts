
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { optionIndex } = await request.json();

  if (optionIndex === undefined || optionIndex === null) {
    return NextResponse.json(
      { error: "Please provide an option index." },
      { status: 400 }
    );
  }

  const { error } = await supabase.from("votes").insert([
    {
      poll_id: params.id,
      user_id: user?.id ?? null,
      option_index: optionIndex,
    },
  ]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Vote submitted successfully" });
}
