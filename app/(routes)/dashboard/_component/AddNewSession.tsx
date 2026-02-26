"use client";

import React, { useState } from "react";
import axios from "axios";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

function AddNewSession({ children }: { children?: React.ReactNode }) {
  const [note, setNote] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const [suggestedDoctors, settSuggestedDoctors] = useState<any[]>([]);
  const [creating, setCreating] = useState<boolean>(false);
  const { user } = useUser();
  const router = useRouter();
  // ✅ API CALL
  const onClickNext = async () => {
    if (!note.trim()) return;

    try {
      setLoading(true);

      const result = await axios.post("/api/suggest-doctors", {
        notes: note,
      });

      // ✅ SHOW DATA IN CONSOLE
      console.log("Suggested Doctors Response:");
      settSuggestedDoctors(result.data);
      console.log(result.data);

    } catch (error) {
      console.error("API Error:", error);
    } finally {
      setLoading(false);
    }
  };
  const onSelectDoctor = async (doctor: any) => {
    if (!note.trim()) return;
    try {
      setCreating(true);
      const res = await axios.post("/api/create-session", {
        notes: note,
        selectedDoctor: doctor,
        userEmail: user?.primaryEmailAddress?.emailAddress,
      });
      console.log("Created sessionId:", res.data.sessionId);
      if (res.data?.sessionId) {
        router.push(`/consult/${res.data.sessionId}`);
      }
    } catch (error) {
      console.error("API Error:", error);
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      
      {/* Trigger */}
      <DialogTrigger asChild>
        {children ? (
          children
        ) : (
          <button className="bg-black text-white px-6 py-3 rounded-lg hover:scale-105 transition">
            + Start a Consultation
          </button>
        )}
      </DialogTrigger>

      {/* Modal */}
      <DialogContent className="sm:max-w-md">

        <DialogHeader>
          <DialogTitle>
            Start New Consultation
          </DialogTitle>

          <DialogDescription>
            Describe your symptoms and our AI doctor will assist you.
          </DialogDescription>
        </DialogHeader>

        {/* FORM */}
        <div className="space-y-4 mt-4">

          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Describe your symptoms..."
            className="w-full border rounded-lg p-3 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-black"
          />

          <button
            onClick={onClickNext}
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-lg hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? "Analyzing Symptoms..." : "Continue"}
          </button>

          {suggestedDoctors.length > 0 && (
            <div className="space-y-3">
              {suggestedDoctors.map((doctor: any) => (
                <div
                  key={doctor.id}
                  className="flex items-center justify-between border rounded-lg p-3"
                >
                  <div className="text-sm">
                    <div className="font-medium">{doctor.specialist}</div>
                    <div className="text-gray-500">{doctor.description}</div>
                  </div>
                  <button
                    onClick={() => onSelectDoctor(doctor)}
                    disabled={creating}
                    className="bg-black text-white px-4 py-2 rounded-lg disabled:opacity-50"
                  >
                    {creating ? "Saving..." : "Select"}
                  </button>
                </div>
              ))}
            </div>
          )}

        </div>

      </DialogContent>
    </Dialog>
  );
}

export default AddNewSession;
