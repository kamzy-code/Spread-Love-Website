"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TriangleAlert } from "lucide-react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useFetchAdminBookingPopup, useUpdateBookingPopup } from "@/hooks/useBookingPopup";
import { POPUP_BODY_WORD_LIMIT, POPUP_TITLE_MAX_CHARS } from "@/lib/bookingOptions";
import { wordCount } from "@/lib/wordCount";
import PageLoading from "../ui/pageLoading";
import PageError from "../ui/pageError";
import AdminShell from "../ui/AdminShell";
import ActionStatusModal from "../ui/updateModal";
import AuditLogSidebar from "../ui/AuditLogSidebar";
import BookingPopupCard from "@/components/book/BookingPopupCard";

interface PopupForm {
  enabled: boolean;
  title: string;
  body: string;
}

// Superadmin-only — same as service mutations. The pop-up is shown once per
// browser session on the public booking page.
export default function PopupSettings() {
  const router = useRouter();
  const { user, authStatus, authError, loading } = useAdminAuth();
  const [mounted, setMounted] = useState(false);
  const isSuperAdmin = user?.role === "superadmin";

  const { data: saved, isLoading, error: loadError } = useFetchAdminBookingPopup();
  const mutation = useUpdateBookingPopup();

  const [form, setForm] = useState<PopupForm>({ enabled: false, title: "", body: "" });
  const [hydrated, setHydrated] = useState(false);
  const [modal, setModal] = useState<{ error?: string; success?: string } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (authStatus === "unauthenticated") router.replace("/admin");
  }, [authStatus, router]);

  // Seed the form once from the saved copy; later refetches (after a save)
  // must not clobber what the admin is typing.
  useEffect(() => {
    if (saved && !hydrated) {
      setForm({ enabled: saved.enabled, title: saved.title, body: saved.body });
      setHydrated(true);
    }
  }, [saved, hydrated]);

  if (!mounted) return null;
  if (loading || authStatus === "checking") return <PageLoading></PageLoading>;
  if (authStatus === "error" && authError) return <PageError></PageError>;
  if (authStatus !== "authenticated") return null;

  if (!isSuperAdmin) {
    return (
      <AdminShell>
        <div className="flex flex-col justify-center items-center h-full w-full gap-4">
          <TriangleAlert className="h-8 w-8 text-gray-500" />
          <p className="text-gray-700">Unauthorized</p>
          <button
            className="btn-primary rounded-lg"
            onClick={() => router.replace("/admin/dashboard")}
          >
            Go Back
          </button>
        </div>
      </AdminShell>
    );
  }

  const bodyWords = wordCount(form.body);
  const overLimit = bodyWords > POPUP_BODY_WORD_LIMIT;
  const needsContent = form.enabled && (!form.title.trim() || !form.body.trim());
  const unchanged =
    !!saved &&
    saved.enabled === form.enabled &&
    saved.title === form.title.trim() &&
    saved.body === form.body.trim();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await mutation.mutateAsync({
        enabled: form.enabled,
        title: form.title.trim(),
        body: form.body.trim(),
      });
      setModal({ success: "Pop-up saved." });
    } catch (error) {
      setModal({ error: error instanceof Error ? error.message : "Failed to save the pop-up" });
    }
  };

  return (
    <AdminShell>
      <section className="flex flex-col lg:flex-row w-full gap-6">
        <motion.div
          className="py-6 md:py-12 flex-1 min-w-0 space-y-8"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div>
            <h1 className="text-3xl font-bold">Booking Pop-up</h1>
            <p className="text-gray-600 text-sm mt-1">
              A short message shown to customers when they open the booking page. It appears once
              per browser session, and again after you edit the copy.
            </p>
          </div>

          {isLoading && !hydrated ? (
            <PageLoading></PageLoading>
          ) : loadError ? (
            <p className="text-red-500">Couldn&apos;t load the pop-up settings.</p>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
              <form onSubmit={handleSave} className="card p-6 space-y-5 text-brand-start">
                <label className="flex items-center gap-3 cursor-pointer w-fit">
                  <input
                    type="checkbox"
                    checked={form.enabled}
                    onChange={(e) => setForm((prev) => ({ ...prev, enabled: e.target.checked }))}
                    className="h-5 w-5 rounded border-gray-300 text-brand-end focus:ring-brand-end"
                  />
                  <span className="text-gray-700 font-medium">
                    Show this pop-up on the booking page
                  </span>
                </label>

                <div className="flex flex-col space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-gray-700 font-medium" htmlFor="popup-title">
                      Title
                    </label>
                    <span className="text-xs text-gray-500">
                      {form.title.length}/{POPUP_TITLE_MAX_CHARS}
                    </span>
                  </div>
                  <input
                    id="popup-title"
                    type="text"
                    value={form.title}
                    maxLength={POPUP_TITLE_MAX_CHARS}
                    onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g. Celebrating more than one person?"
                    className="px-4 py-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-brand-end focus:border-transparent"
                  />
                </div>

                <div className="flex flex-col space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-gray-700 font-medium" htmlFor="popup-body">
                      Message
                    </label>
                    <span className={`text-xs ${overLimit ? "text-red-500" : "text-gray-500"}`}>
                      {bodyWords}/{POPUP_BODY_WORD_LIMIT} words
                    </span>
                  </div>
                  <textarea
                    id="popup-body"
                    rows={5}
                    value={form.body}
                    onChange={(e) => setForm((prev) => ({ ...prev, body: e.target.value }))}
                    placeholder="Add a recipient for each of your loved ones — they all go in one booking and you only pay once."
                    className="px-4 py-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-brand-end focus:border-transparent resize-none"
                  />
                </div>

                {needsContent && (
                  <p className="text-sm text-red-500">
                    Add a title and a message before turning the pop-up on.
                  </p>
                )}

                <button
                  type="submit"
                  disabled={mutation.isPending || overLimit || needsContent || unchanged}
                  className="btn-primary rounded-lg w-full h-12 flex items-center justify-center disabled:opacity-50"
                >
                  {mutation.isPending ? "Saving..." : "Save"}
                </button>
              </form>

              <div>
                <p className="text-sm font-medium text-gray-500 mb-3">
                  Preview {form.enabled ? "" : "(pop-up is currently off)"}
                </p>
                <div className="gradient-background-soft rounded-xl p-6 flex justify-center">
                  <BookingPopupCard
                    title={form.title.trim()}
                    body={form.body.trim()}
                    preview
                  />
                </div>
              </div>
            </div>
          )}
        </motion.div>

        <AuditLogSidebar entity="popup" entityId="booking-popup" isSuperAdmin={isSuperAdmin} />
      </section>

      {modal && (
        <ActionStatusModal
          setShowModal={() => setModal(null)}
          error={modal.error}
          success={modal.success}
        />
      )}
    </AdminShell>
  );
}
