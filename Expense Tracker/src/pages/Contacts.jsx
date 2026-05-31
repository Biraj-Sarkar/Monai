import { useState } from 'react';
import { toast } from '../utils/toast';

export default function Contacts() {
  const [submitting, setSubmitting] = useState(false);
  const [subscribing, setSubscribing] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const data = {
      name: form.name.value,
      email: form.email.value,
      subject: form.subject.value,
      message: form.message.value,
    };

    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      });

      const payload = await res.json().catch(() => ({}));

      if (res.ok) {
        toast.success(payload.message || 'Message sent — we will reply soon.');
        form.reset();
      } else {
        toast.error(payload.error || payload.message || 'Failed to send message.');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to send message.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const email = form.elements.email?.value?.trim();

    if (!email) {
      toast.error('Please enter an email address.');
      return;
    }

    setSubscribing(true);
    try {
      const res = await fetch(`${API_URL}/api/contact/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
        credentials: 'include',
      });

      const payload = await res.json().catch(() => ({}));

      if (res.ok) {
        toast.success(payload.message || 'Subscribed Successfully.');
        form.reset();
      } else {
        toast.error(payload.error || payload.message || 'Failed to subscribe.');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to subscribe.');
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <div className="min-h-screen app-page-bg">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-12">
        <h1 className="text-center mt-4 text-4xl sm:text-[2.75rem] font-black tracking-tight leading-[1.1] text-slate-950 dark:text-white">
          Contact Us
        </h1>

        <div className="mt-10 grid gap-8 lg:grid-cols-2 items-start">
          {/* Left: contact info */}
          <div className="space-y-6">
            <p className="max-w-lg text-slate-700 dark:text-slate-300">
              Have a question or need help getting set up? Send us a message and our support team will get back to you within 24 hours.
            </p>

            <div className="rounded-2xl border border-white/8 bg-white/5 p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Get In Touch</h3>
              <p className="mt-3 text-sm text-slate-500">You can also visit our support centres or send an email to our team.</p>

              <ul className="mt-6 space-y-4">
                <li className="flex gap-4">
                  <div className="h-12 w-12 shrink-0 rounded-full bg-violet-600/20 flex items-center justify-center text-white">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-900 dark:text-white">Guwahati, Assam</div>
                    <div className="mt-1 text-xs text-slate-500">IIT Guwahati, Guwahati, Assam - 781039</div>
                  </div>
                </li>

                {/* <li className="flex gap-4">
                  <div className="h-12 w-12 shrink-0 rounded-full bg-cyan-500/20 flex items-center justify-center text-white">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="7" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-900 dark:text-white">Pakuwon City, Surabaya</div>
                    <div className="mt-1 text-xs text-slate-500">Jl. Kejawan Putih Indah, Mulyorejo, SBY - 60112</div>
                  </div>
                </li> */}
              </ul>
            </div>
          </div>

          {/* Right: contact form */}
          <div>
            <form onSubmit={handleSubmit} className="rounded-2xl border border-white/8 bg-white/5 p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Your Detail</h3>

              <div className="mt-4 grid grid-cols-1 gap-3">
                <label className="text-xs text-slate-400">Name</label>
                <input name="name" required className="rounded-md bg-transparent border border-white/6 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-400" placeholder="Your Name" />

                <label className="text-xs text-slate-400">Email Address</label>
                <input name="email" type="email" required className="rounded-md bg-transparent border border-white/6 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-400" placeholder="you@email.com" />

                <label className="text-xs text-slate-400">Subject</label>
                <input name="subject" className="rounded-md bg-transparent border border-white/6 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-400" placeholder="Message Subject" />

                <label className="text-xs text-slate-400">Comments / Questions</label>
                <textarea name="message" rows="5" className="rounded-md bg-transparent border border-white/6 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-400" placeholder="Your Message" />
              </div>

              <div className="mt-4 flex items-center justify-between">
                <button type="submit" disabled={submitting} className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white shadow transition ${submitting ? 'bg-slate-500 cursor-not-allowed' : 'bg-violet-500 hover:bg-violet-600'}`}>
                  {submitting ? 'Sending...' : 'Send Message'}
                </button>
                <span className="text-xs text-slate-400">or email us at <a href="mailto:support@expensetracker.app" className="text-violet-400 hover:underline">support@expensetracker.app</a></span>
              </div>
            </form>
          </div>
        </div>

        {/* Map */}
        <div className="mt-12 rounded-xl overflow-hidden border border-white/6">
          <iframe
            title="map"
            src="https://www.google.com/maps?q=IIT%20Guwahati%2CAssam&output=embed"
            className="w-full h-64 grayscale"
            loading="lazy"
          />
        </div>

        {/* Newsletter CTA */}
        <div className="mt-10 rounded-2xl bg-linear-to-r from-violet-500 to-cyan-400 p-6 text-white">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center gap-4 justify-between">
            <div>
              <h4 className="text-xl font-bold">Keep Updated About Our Product</h4>
              <p className="mt-1 text-sm text-white/90">Subscribe for product updates, feature launches and tips.</p>
            </div>

            <form className="w-full sm:w-auto flex gap-2" onSubmit={handleSubscribe}>
              <input name="email" type="email" required placeholder="Your email address" aria-label="Email" className="rounded-full px-4 py-2 text-sm text-slate-900" />
              <button type="submit" disabled={subscribing} className={`rounded-full px-4 py-2 text-sm font-semibold text-white transition ${subscribing ? 'bg-slate-700 cursor-not-allowed' : 'bg-slate-900/90 hover:bg-slate-950'}`}>
                {subscribing ? 'Submitting...' : 'Submit'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}