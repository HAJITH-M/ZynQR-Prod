import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { submitContactForm } from "../../api/contact.api";
import TextField from "../../components/ui/TextField";
import { CONTACT_QUICK_LINKS, CONTACT_TOPICS } from "../../lib/landing/contactContent";
import { joinFieldClass, UI_FIELD_LABEL_DEFAULT } from "../../lib/ui/fieldStyles";
import { toastApiError, toastSuccess, toastWarning } from "../../utils/toast";

const textareaClass = joinFieldClass(
  "scan-field-input min-h-[140px] w-full resize-y px-4 py-3",
);

export default function LandingContact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState(CONTACT_TOPICS[0].value);
  const [message, setMessage] = useState("");

  const contactMutation = useMutation({
    mutationFn: submitContactForm,
    onSuccess: (data) => {
      toastSuccess(data?.message ?? "Message sent. We'll reply by email soon.");
      setName("");
      setEmail("");
      setTopic(CONTACT_TOPICS[0].value);
      setMessage("");
    },
    onError: (err) => {
      toastApiError(err, "Could not send your message. Please try again.");
    },
  });

  useEffect(() => {
    const prev = document.title;
    document.title = "Contact - ZynQR";
    return () => {
      document.title = prev;
    };
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedMessage = message.trim();

    if (!trimmedName) {
      toastWarning("Please enter your name.");
      return;
    }
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      toastWarning("Please enter a valid email address.");
      return;
    }
    if (trimmedMessage.length < 10) {
      toastWarning("Please enter at least 10 characters in your message.");
      return;
    }

    contactMutation.mutate({
      name: trimmedName,
      email: trimmedEmail,
      topic,
      message: trimmedMessage,
    });
  }

  const isPending = contactMutation.isPending;

  return (
    <section className="bg-surface-container-low px-6 py-16 md:px-8 md:py-24">
      <div className="container mx-auto max-w-5xl">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h1 className="font-headline text-4xl font-extrabold tracking-tight md:text-5xl">Contact us</h1>
          <p className="mt-4 text-lg text-on-surface-variant">
            Questions about ZynQR, your account, or the API? Send a message — we typically reply within one business
            day.
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-5 lg:gap-12">
          <aside className="lg:col-span-2">
            <div className="rounded-3xl border border-outline-variant/20 bg-surface-container-lowest p-6">
              <h2 className="font-headline mb-4 text-sm font-bold tracking-wide text-on-surface-variant uppercase">
                Self-service
              </h2>
              <ul className="space-y-4">
                {CONTACT_QUICK_LINKS.map((item) => (
                  <li key={item.title}>
                    <Link
                      className="group flex gap-3 rounded-2xl p-2 transition-colors hover:bg-surface-container-low"
                      to={item.to}
                    >
                      <span className="material-symbols-outlined mt-0.5 shrink-0 text-primary">{item.icon}</span>
                      <span>
                        <span className="font-headline block text-sm font-bold text-on-surface group-hover:text-primary">
                          {item.title}
                        </span>
                        <span className="text-xs leading-relaxed text-on-surface-variant">{item.description}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          <form
            className="rounded-3xl border border-outline-variant/20 bg-surface-container-lowest p-6 shadow-sm md:p-8 lg:col-span-3"
            onSubmit={handleSubmit}
          >
            <h2 className="font-headline mb-6 text-xl font-bold">Send a message</h2>
            <div className="space-y-5">
              <TextField
                id="contact-name"
                name="name"
                label="Your name"
                placeholder="Jane Doe"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isPending}
              />
              <TextField
                id="contact-email"
                name="email"
                label="Email"
                placeholder="you@company.com"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isPending}
              />
              <div className="space-y-2">
                <label className={UI_FIELD_LABEL_DEFAULT} htmlFor="contact-topic">
                  Topic
                </label>
                <select
                  id="contact-topic"
                  name="topic"
                  className={joinFieldClass("scan-field-input w-full cursor-pointer px-4 py-3")}
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  disabled={isPending}
                >
                  {CONTACT_TOPICS.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className={UI_FIELD_LABEL_DEFAULT} htmlFor="contact-message">
                  Message
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  className={textareaClass}
                  placeholder="How can we help?"
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  disabled={isPending}
                />
              </div>
            </div>
            <p className="mt-4 text-xs text-on-surface-variant">
              We email your message to our team and reply to the address you provide. Sign in first if your question
              is about a specific account.
            </p>
            <button
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-primary px-8 py-3.5 text-sm font-bold text-on-primary shadow-lg shadow-primary/20 transition-all hover:bg-white hover:text-primary disabled:cursor-not-allowed disabled:opacity-60 md:w-auto"
              type="submit"
              disabled={isPending}
            >
              <span className="material-symbols-outlined text-lg">send</span>
              {isPending ? "Sending email…" : "Send message"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
