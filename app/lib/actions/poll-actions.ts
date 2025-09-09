"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// CREATE POLL
export async function createPoll(formData: FormData) {
  try {
    const supabase = await createClient();
    // Sanitize and dedupe input
    let question = (formData.get("question") as string | undefined) ?? "";
    question = question.trim();
    let options = (formData.getAll("options") as string[])
      .map(opt => (typeof opt === "string" ? opt.trim() : ""))
      .filter(opt => opt.length > 0);
    // Remove duplicates
    options = Array.from(new Set(options));
    if (!question || options.length < 2) {
      return { error: "Please provide a question and at least two options." };
    }
    // Get user from session
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError) {
      return { error: userError.message };
    }
    if (!user) {
      return { error: "You must be logged in to create a poll." };
    }
    const { error } = await supabase.from("polls").insert([
      {
        user_id: user.id,
        question,
        options,
      },
    ]);
    if (error) {
      return { error: error.message };
    }
    revalidatePath("/polls");
    return { error: null };
  } catch (err: any) {
    return { error: err?.message || "An unexpected error occurred." };
  }
}

// GET USER POLLS
export async function getUserPolls() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { polls: [], error: "Not authenticated" };
    const { data, error } = await supabase
      .from("polls")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (error) return { polls: [], error: error.message };
    return { polls: data ?? [], error: null };
  } catch (err: any) {
    return { polls: [], error: err?.message || "An unexpected error occurred." };
  }
}

// GET POLL BY ID
export async function getPollById(id: string) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("polls")
      .select("*")
      .eq("id", id)
      .single();
    if (error) return { poll: null, error: error.message };
    return { poll: data, error: null };
  } catch (err: any) {
    return { poll: null, error: err?.message || "An unexpected error occurred." };
  }
}

// SUBMIT VOTE
export async function submitVote(pollId: string, optionIndex: number) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Fetch poll to validate optionIndex
    const { data: poll, error: pollError } = await supabase
      .from("polls")
      .select("options")
      .eq("id", pollId)
      .single();
    if (pollError || !poll) {
      return { error: "Poll not found." };
    }
    const options: string[] = Array.isArray(poll.options) ? poll.options : [];
    if (!Number.isInteger(optionIndex) || optionIndex < 0 || optionIndex >= options.length) {
      return { error: "Invalid option selected." };
    }

    // Prevent duplicate votes for authenticated users
    if (user?.id) {
      const { data: existingVote, error: voteCheckError } = await supabase
        .from("votes")
        .select("id")
        .eq("poll_id", pollId)
        .eq("user_id", user.id)
        .maybeSingle();
      if (voteCheckError) {
        return { error: voteCheckError.message };
      }
      if (existingVote) {
        return { error: "You have already voted in this poll." };
      }
    }

    const { error } = await supabase.from("votes").insert([
      {
        poll_id: pollId,
        user_id: user?.id ?? null,
        option_index: optionIndex,
      },
    ]);
    if (error) return { error: error.message };
    return { error: null };
  } catch (err: any) {
    return { error: err?.message || "An unexpected error occurred." };
  }
}

// DELETE POLL
export async function deletePoll(id: string) {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("polls").delete().eq("id", id);
    if (error) return { error: error.message };
    revalidatePath("/polls");
    return { error: null };
  } catch (err: any) {
    return { error: err?.message || "An unexpected error occurred." };
  }
}

// UPDATE POLL
export async function updatePoll(pollId: string, formData: FormData) {
  try {
    const supabase = await createClient();
    // Sanitize and dedupe input
    let question = (formData.get("question") as string | undefined) ?? "";
    question = question.trim();
    let options = (formData.getAll("options") as string[])
      .map(opt => (typeof opt === "string" ? opt.trim() : ""))
      .filter(opt => opt.length > 0);
    // Remove duplicates
    options = Array.from(new Set(options));
    if (!question || options.length < 2) {
      return { error: "Please provide a question and at least two options." };
    }
    // Get user from session
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError) {
      return { error: userError.message };
    }
    if (!user) {
      return { error: "You must be logged in to update a poll." };
    }
    // Only allow updating polls owned by the user
    const { error } = await supabase
      .from("polls")
      .update({ question, options })
      .eq("id", pollId)
      .eq("user_id", user.id);
    if (error) {
      return { error: error.message };
    }
    return { error: null };
  } catch (err: any) {
    return { error: err?.message || "An unexpected error occurred." };
  }
}
