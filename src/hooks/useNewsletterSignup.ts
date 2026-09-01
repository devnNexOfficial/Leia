import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { sendNewsletterWelcomeEmail } from "@/lib/order-emails";

type SignupStatus = "idle" | "loading" | "success" | "duplicate" | "error";

export function useNewsletterSignup() {
  const [email, setEmail] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState<SignupStatus>("idle");
  const [message, setMessage] = useState("");

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Honeypot spam check: Bots fill hidden inputs; humans don't
    if (honeypot.trim()) {
      // Silently discard bot submission with simulated success
      setStatus("success");
      setMessage("🎉 Thanks for subscribing! Use code: LEIA15 for 15% OFF.");
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(normalizedEmail)) {
      setStatus("error");
      setMessage("Please enter a valid email address.");
      return;
    }
    if (!supabase) {
      setStatus("error");
      setMessage("Newsletter signup is unavailable right now. Please try again shortly.");
      return;
    }
    setStatus("loading");
    setMessage("");
    const { error } = await supabase.from("newsletter_subscribers").insert({ email: normalizedEmail });
    if (!error) {
      setStatus("success");
      setMessage("🎉 Subscribed! Use code: LEIA15 for 15% OFF at checkout.");
      sendNewsletterWelcomeEmail(normalizedEmail, "LEIA15").catch(() => {});
      return;
    }
    if (error.code === "23505") {
      setStatus("duplicate");
      setMessage("You're already subscribed! Use code: LEIA15 for 15% OFF.");
      return;
    }
    setStatus("error");
    setMessage("We couldn't subscribe you right now. Please try again.");
  };

  return { email, setEmail, honeypot, setHoneypot, status, message, submit };
}
