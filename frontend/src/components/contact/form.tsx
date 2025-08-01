"use client";
import React, { useState, useEffect } from "react";
import { Send } from "lucide-react";
import { useMutation } from "@tanstack/react-query";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

function ContactForm() {
  const [mounted, setMounted] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [errorFields, setErrorFields] = useState({
    name: false,
    email: false,
    subject: false,
    message: false,
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleOnChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrorFields = {
      name: !formData.name,
      email: !formData.email,
      subject: !formData.subject,
      message: !formData.message,
    };

    setErrorFields(newErrorFields);

    const hasError = Object.values(newErrorFields).some((val) => val === true);

    if (hasError) {
      return;
    }

    mutation.mutate();
  };

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${apiUrl}/email/contact`, {
        credentials: "include",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to send booking confirmation");
      }
    },

    retry: 3,

    onSuccess: () => {
      setIsSubmitted(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
    },

    onError: (error) => {
      throw new Error(error.message || "Failed to send booking confirmation");
    },
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; // Avoid SSR
  return (
    <div className="card p-8 w-full">
      <h2 className="gradient-text text-3xl font-semibold mb-4 pb-2">
        {" "}
        Send us a Message
      </h2>
      {isSubmitted ? (
        <div className="text-center py-8">
          <div className="text-6xl mb-4">✉️</div>
          <h3 className="text-2xl font-semibold text-green-600 mb-2">
            Message Sent!
          </h3>
          <p className="text-gray-600 mb-4">
            {`Thank you for reaching out. We'll get back to you within 24 hours.`}
          </p>
          <button className="btn-primary" onClick={() => setIsSubmitted(false)}>
            Send Another Message
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6 text-brand-start">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col space-y-2">
              <label className="text-gray-700">Name *</label>
              <input
                className={`px-4 py-3 border ${
                  errorFields.name ? "border-red-500" : "border-gray-300"
                } rounded-lg w-full focus:ring-2 focus:ring-brand-end focus:border-transparent placeholder:text-gray-400`}
                type="text"
                name="name"
                value={formData.name}
                onChange={handleOnChange}
                required
                placeholder="Your full name"
              />
              {errorFields.name && (
                <span className="text-red-500 text-xs">
                  This field is required
                </span>
              )}
            </div>

            <div className="flex flex-col space-y-2">
              <label className="text-gray-700">Email *</label>
              <input
                className={`px-4 py-3 border ${
                  errorFields.email ? "border-red-500" : "border-gray-300"
                } rounded-lg w-full focus:ring-2 focus:ring-brand-end focus:border-transparent placeholder:text-gray-400`}
                type="email"
                name="email"
                value={formData.email}
                onChange={handleOnChange}
                required
                placeholder="your.email@example.com"
              />
              {errorFields.email && (
                <span className="text-red-500 text-xs">
                  This field is required
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col space-y-2">
            <label className="text-gray-700">Subject *</label>
            <select
              name="subject"
              id="subject"
              className={`px-4 py-3 border ${
                errorFields.subject ? "border-red-500" : "border-gray-300"
              } rounded-lg w-full focus:ring-2 focus:ring-brand-end focus:border-transparent`}
              onChange={handleOnChange}
              value={formData.subject}
              required
            >
              <option value="">Select a subject</option>
              <option value="Booking Help">Booking Help</option>
              <option value="Technical Support">Technical Support</option>
              <option value="Billing Question">Billing Question</option>
              <option value="Feedback">Feedback</option>
              <option value="Partnership Inquiry">Partnership Inquiry</option>
              <option value="other">Other</option>
            </select>
            {errorFields.subject && (
              <span className="text-red-500 text-xs">
                This field is required
              </span>
            )}
          </div>

          <div className="flex flex-col space-y-2">
            <label className="text-gray-700">Message *</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleOnChange}
              required
              rows={5}
              placeholder="How can we help you?"
              className={`px-4 py-3 border ${
                errorFields.message ? "border-red-500" : "border-gray-300"
              } rounded-lg w-full focus:ring-2 focus:ring-brand-end focus:border-transparent placeholder:text-gray-400 resize-none`}
            ></textarea>
            {errorFields.message && (
              <span className="text-red-500 text-xs">
                This field is required
              </span>
            )}
          </div>

          <button
            type="submit"
            className="btn-primary w-full"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <div>
                <svg
                  className="animate-spin h-5 w-5 text-white mx-auto"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  ></path>
                </svg>
                <span className="sr-only">Sending...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <Send className="w-5 h-5 mr-2"></Send>
                <p>Send us a message</p>
              </div>
            )}
          </button>
        </form>
      )}
    </div>
  );
}

export default ContactForm;
