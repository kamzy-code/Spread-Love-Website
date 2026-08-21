"use client";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { XCircle, ClipboardList, Pencil } from "lucide-react";
import MiniLoader from "../../ui/miniLoader";
import { RatingTemplate } from "@/lib/types";
import {
  useRatingTemplates,
  useActivateRatingTemplate,
  useDeactivateRatingTemplate,
} from "@/hooks/useRatingTemplates";
import RatingTemplateFormModal from "./RatingTemplateFormModal";
import ToggleRatingTemplateStatusModal from "./ToggleRatingTemplateStatusModal";

export default function RatingTemplateList() {
  const queryClient = useQueryClient();
  const { data: templates, error, isLoading, refetch } = useRatingTemplates();
  const [editingTemplate, setEditingTemplate] = useState<RatingTemplate | null>(null);
  const [toggleTarget, setToggleTarget] = useState<{
    template: RatingTemplate;
    action: "activate" | "deactivate";
  } | null>(null);
  const [toggleError, setToggleError] = useState("");

  const activateMutation = useActivateRatingTemplate();
  const deactivateMutation = useDeactivateRatingTemplate();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["ratingTemplates"] });
    queryClient.invalidateQueries({ queryKey: ["ratingTemplate", "active"] });
  };

  const handleConfirmToggle = async () => {
    if (!toggleTarget) return;
    setToggleError("");
    const mutation = toggleTarget.action === "activate" ? activateMutation : deactivateMutation;
    try {
      await mutation.mutateAsync(toggleTarget.template._id);
      invalidate();
      setToggleTarget(null);
    } catch (err) {
      setToggleError(err instanceof Error ? err.message : "Failed to update template status");
    }
  };

  if (error)
    return (
      <div className="flex flex-col justify-center items-center text-gray-500 gap-4 py-12">
        <XCircle className="h-8 w-8 text-red-500" />
        <p className="text-gray-500">Error Fetching Rating Templates</p>
        <button
          className="btn-primary h-10 rounded-lg flex justify-center items-center px-6"
          onClick={() => refetch()}
        >
          Try again
        </button>
      </div>
    );

  if (isLoading)
    return (
      <div className="py-12 flex justify-center">
        <MiniLoader></MiniLoader>
      </div>
    );

  if (!templates || templates.length === 0)
    return (
      <div className="flex flex-col justify-center items-center text-gray-500 py-12">
        <ClipboardList className="h-6 w-6" />
        <p className="text-sm">No rating templates yet</p>
      </div>
    );

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        {templates.map((template) => (
          <div key={template._id} className="card p-6 space-y-3">
            <div className="flex justify-between items-start">
              <h2 className="font-medium text-brand-start">{template.name}</h2>
              <p className={template.active ? "text-green-500" : "text-gray-500"}>
                {template.active ? "Active" : "Inactive"}
              </p>
            </div>

            <div className="text-gray-700 text-sm space-y-2">
              <div className="flex justify-between items-center">
                <p>Criteria:</p>
                <p className="text-brand-start">{template.criteria.length}</p>
              </div>
              {template.passFailThreshold !== undefined && (
                <div className="flex justify-between items-center">
                  <p>Pass Threshold:</p>
                  <p className="text-brand-start">{template.passFailThreshold}</p>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                className="flex-1 flex items-center justify-center gap-1 text-sm border border-brand-end text-brand-end rounded-lg py-2 hover:bg-brand-end hover:text-white transition"
                onClick={() => setEditingTemplate(template)}
              >
                <Pencil className="h-4 w-4" /> Edit
              </button>
              <button
                className={`flex-1 text-sm rounded-lg py-2 transition ${
                  template.active
                    ? "border border-red-400 text-red-500 hover:bg-red-500 hover:text-white"
                    : "btn-primary"
                }`}
                onClick={() =>
                  setToggleTarget({
                    template,
                    action: template.active ? "deactivate" : "activate",
                  })
                }
              >
                {template.active ? "Deactivate" : "Activate"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {editingTemplate && (
        <RatingTemplateFormModal
          template={editingTemplate}
          onClose={() => setEditingTemplate(null)}
        />
      )}

      {toggleTarget && (
        <ToggleRatingTemplateStatusModal
          templateName={toggleTarget.template.name}
          action={toggleTarget.action}
          onCancel={() => {
            setToggleTarget(null);
            setToggleError("");
          }}
          onConfirm={handleConfirmToggle}
          isPending={activateMutation.isPending || deactivateMutation.isPending}
          errorMessage={toggleError}
        />
      )}
    </>
  );
}
