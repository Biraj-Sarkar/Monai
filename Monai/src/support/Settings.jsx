import { useState } from "react";

export default function Settings() {
	const [profile, setProfile] = useState({
		name: "",
		email: "",
	});

	const [password, setPassword] = useState({
		currentPassword: "",
		newPassword: "",
		confirmPassword: "",
	});

	const [notifications, setNotifications] = useState({
		emailAlerts: true,
		pushAlerts: true,
		weeklySummary: true,
		budgetWarnings: true,
	});

	const [preferences, setPreferences] = useState({
		theme: "system",
		currency: "USD",
		language: "English",
	});

	const [saveMessage, setSaveMessage] = useState("");

	const handleSave = (section) => {
		setSaveMessage(`${section} settings saved successfully.`);
		window.setTimeout(() => setSaveMessage(""), 3000);
	};

	const handlePasswordSave = (event) => {
		event.preventDefault();
		if (password.newPassword !== password.confirmPassword) {
			setSaveMessage("New password and confirm password must match.");
			return;
		}
		handleSave("Password");
	};

	return (
		<div className="min-h-screen app-page-bg py-10 px-4 sm:px-6 lg:px-8">
			<div className="mx-auto max-w-5xl">
				<div className="mb-8 text-center">
					<h1 className="bg-clip-text text-transparent bg-linear-to-r from-[#2E1A47] to-[#D80032] dark:from-cyan-500 dark:to-pink-500 text-4xl sm:text-5xl font-bold leading-relaxed">Settings</h1>
					<p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400">Manage your profile, security, notifications, and app preferences.</p>
				</div>

				{saveMessage ? (
					<div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
						{saveMessage}
					</div>
				) : null}

				<div className="grid gap-6">
					<section className="rounded-3xl border border-slate-200/70 bg-white/60 dark:bg-slate-900/60 p-6 shadow-[0_28px_70px_rgba(15,18,28,0.12)] backdrop-blur-xl">
						<div className="mb-5">
							<h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Profile</h2>
							<p className="text-sm text-slate-600 dark:text-slate-400">Update your name and contact email.</p>
						</div>

						<div className="grid gap-4 sm:grid-cols-2">
							<label className="block">
								<span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">User name</span>
								<input
									type="text"
									value={profile.name}
									onChange={(event) => setProfile((current) => ({ ...current, name: event.target.value }))}
									className="w-full rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#D80032] dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-100"
									placeholder="Enter your name"
								/>
							</label>

							<label className="block">
								<span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Email address</span>
								<input
									type="email"
									value={profile.email}
									onChange={(event) => setProfile((current) => ({ ...current, email: event.target.value }))}
									className="w-full rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#D80032] dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-100"
									placeholder="Enter your email"
								/>
							</label>
						</div>

						<div className="mt-4 flex justify-end">
							<button
								type="button"
								onClick={() => handleSave("Profile")}
								className="rounded-2xl bg-linear-to-r from-[#2E1A47] to-[#D80032] px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:opacity-95 dark:from-cyan-500 dark:to-pink-500"
							>
								Save profile
							</button>
						</div>
					</section>

					<section className="rounded-3xl border border-slate-200/70 bg-white/60 dark:bg-slate-900/60 p-6 shadow-[0_28px_70px_rgba(15,18,28,0.12)] backdrop-blur-xl">
						<div className="mb-5">
							<h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Security</h2>
							<p className="text-sm text-slate-600 dark:text-slate-400">Change your password and keep your account protected.</p>
						</div>

						<form className="grid gap-4 sm:grid-cols-3" onSubmit={handlePasswordSave}>
							<label className="block">
								<span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Current password</span>
								<input
									type="password"
									value={password.currentPassword}
									onChange={(event) => setPassword((current) => ({ ...current, currentPassword: event.target.value }))}
									className="w-full rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#D80032] dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-100"
									placeholder="Current password"
								/>
							</label>

							<label className="block">
								<span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">New password</span>
								<input
									type="password"
									value={password.newPassword}
									onChange={(event) => setPassword((current) => ({ ...current, newPassword: event.target.value }))}
									className="w-full rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#D80032] dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-100"
									placeholder="New password"
								/>
							</label>

							<label className="block">
								<span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Confirm password</span>
								<input
									type="password"
									value={password.confirmPassword}
									onChange={(event) => setPassword((current) => ({ ...current, confirmPassword: event.target.value }))}
									className="w-full rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#D80032] dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-100"
									placeholder="Confirm password"
								/>
							</label>

							<div className="sm:col-span-3 flex justify-end">
								<button
									type="submit"
									className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
								>
									Update password
								</button>
							</div>
						</form>
					</section>

					<section className="rounded-3xl border border-slate-200/70 bg-white/60 dark:bg-slate-900/60 p-6 shadow-[0_28px_70px_rgba(15,18,28,0.12)] backdrop-blur-xl">
						<div className="mb-5">
							<h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Notifications</h2>
							<p className="text-sm text-slate-600 dark:text-slate-400">Choose how you want to be notified.</p>
						</div>

						<div className="grid gap-4 sm:grid-cols-2">
							{[
								{ key: "emailAlerts", label: "Email alerts", description: "Receive important account and expense updates." },
								{ key: "pushAlerts", label: "Push notifications", description: "Get browser notifications for quick updates." },
								{ key: "weeklySummary", label: "Weekly summary", description: "See a weekly overview of your spending." },
								{ key: "budgetWarnings", label: "Budget warnings", description: "Be alerted when you are close to your budget." },
							].map((item) => (
								<label key={item.key} className="flex items-start gap-3 rounded-2xl border border-slate-200/70 bg-white/70 p-4 dark:border-slate-700 dark:bg-slate-950/40">
									<input
										type="checkbox"
										checked={notifications[item.key]}
										onChange={(event) => setNotifications((current) => ({ ...current, [item.key]: event.target.checked }))}
										className="mt-1 h-4 w-4 rounded border-slate-300 text-[#D80032] focus:ring-[#D80032]"
									/>
									<span>
										<span className="block text-sm font-semibold text-slate-900 dark:text-slate-100">{item.label}</span>
										<span className="block text-xs text-slate-600 dark:text-slate-400">{item.description}</span>
									</span>
								</label>
							))}
						</div>

						<div className="mt-4 flex justify-end">
							<button
								type="button"
								onClick={() => handleSave("Notification")}
								className="rounded-2xl bg-linear-to-r from-[#2E1A47] to-[#D80032] px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:opacity-95 dark:from-cyan-500 dark:to-pink-500"
							>
								Save notifications
							</button>
						</div>
					</section>

					<section className="rounded-3xl border border-slate-200/70 bg-white/60 dark:bg-slate-900/60 p-6 shadow-[0_28px_70px_rgba(15,18,28,0.12)] backdrop-blur-xl">
						<div className="mb-5">
							<h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Preferences</h2>
							<p className="text-sm text-slate-600 dark:text-slate-400">Personalize the app to your region and workflow.</p>
						</div>

						<div className="grid gap-4 sm:grid-cols-3">
							<label className="block">
								<span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Theme</span>
								<select
									value={preferences.theme}
									onChange={(event) => setPreferences((current) => ({ ...current, theme: event.target.value }))}
									className="w-full rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#D80032] dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-100"
								>
									<option value="system">System</option>
									<option value="light">Light</option>
									<option value="dark">Dark</option>
								</select>
							</label>

							<label className="block">
								<span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Currency</span>
								<select
									value={preferences.currency}
									onChange={(event) => setPreferences((current) => ({ ...current, currency: event.target.value }))}
									className="w-full rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#D80032] dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-100"
								>
									<option value="USD">USD</option>
									<option value="INR">INR</option>
									<option value="EUR">EUR</option>
									<option value="GBP">GBP</option>
								</select>
							</label>

							<label className="block">
								<span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Language</span>
								<select
									value={preferences.language}
									onChange={(event) => setPreferences((current) => ({ ...current, language: event.target.value }))}
									className="w-full rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#D80032] dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-100"
								>
									<option value="English">English</option>
									<option value="Hindi">Hindi</option>
									<option value="Spanish">Spanish</option>
									<option value="French">French</option>
								</select>
							</label>
						</div>

						<div className="mt-4 flex justify-end">
							<button
								type="button"
								onClick={() => handleSave("Preference")}
								className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
							>
								Save preferences
							</button>
						</div>
					</section>

					<section className="rounded-3xl border border-rose-200/70 bg-rose-50/70 p-6 shadow-[0_28px_70px_rgba(15,18,28,0.08)] backdrop-blur-xl dark:border-rose-900/50 dark:bg-rose-950/30">
						<div className="mb-4">
							<h2 className="text-xl font-semibold text-rose-900 dark:text-rose-200">Danger zone</h2>
							<p className="text-sm text-rose-700 dark:text-rose-300">Manage account deletion and data export from here.</p>
						</div>

						<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
							<div>
								<p className="text-sm font-medium text-rose-900 dark:text-rose-100">Delete account</p>
								<p className="text-xs text-rose-700 dark:text-rose-300">This will permanently remove your account and associated data.</p>
							</div>
							<button
								type="button"
								className="rounded-2xl border border-rose-300 bg-white px-5 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 dark:border-rose-700 dark:bg-transparent dark:text-rose-200 dark:hover:bg-rose-950/40"
							>
								Delete account
							</button>
						</div>
					</section>
				</div>
			</div>
		</div>
	);
}