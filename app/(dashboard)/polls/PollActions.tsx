"use client";

import Link from "next/link";
import { useAuth } from "@/app/lib/context/auth-context";
import { Button } from "@/components/ui/button";
import { deletePoll } from "@/app/lib/actions/poll-actions";
import React, { useState, useEffect } from "react";
import QRCodeCanvas from "@/components/QRCodeCanvas";

interface Poll {
  id: string;
  question: string;
  options: any[];
  user_id: string;
}

interface PollActionsProps {
  poll: Poll;
}

export default function PollActions(props: PollActionsProps) {
  const { poll } = props;
  const { user } = useAuth();
  const [showQR, setShowQR] = useState(false);
  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this poll?")) {
      await deletePoll(poll.id);
      window.location.reload();
    }
  };

  // Construct poll link (client-side only)
  const [pollUrl, setPollUrl] = useState("");
  useEffect(() => {
    if (typeof window !== "undefined" && poll && poll.id) {
      setPollUrl(`${window.location.origin}/polls/${poll.id}`);
    }
  }, [poll]);

  return (
    <div className="border rounded-md shadow-md hover:shadow-lg transition-shadow bg-white relative">
      <Link href={`/polls/${poll.id}`}>
        <div className="group p-4">
          <div className="h-full">
            <div>
              <h2 className="group-hover:text-blue-600 transition-colors font-bold text-lg">
                {poll.question}
              </h2>
              <p className="text-slate-500">{poll.options.length} options</p>
            </div>
          </div>
        </div>
      </Link>
      {user && user.id === poll.user_id && (
        <div className="flex gap-2 p-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/polls/${poll.id}/edit`}>Edit</Link>
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setShowQR(true)}>
            QR Code
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      )}
      {/* QR Code Modal */}
      {showQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col items-center">
            <h3 className="font-semibold mb-4">Share this poll</h3>
            {pollUrl ? (
              <>
                <QRCodeCanvas value={pollUrl} size={200} />
                <p className="mt-2 text-xs text-gray-500 break-all text-center">{pollUrl}</p>
              </>
            ) : (
              <div className="text-gray-400">Loading QR code...</div>
            )}
            <Button className="mt-4" onClick={() => setShowQR(false)}>
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
