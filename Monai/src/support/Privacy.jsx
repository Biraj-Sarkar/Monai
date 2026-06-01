export default function Privacy() {
  return (
    <div className="min-h-screen app-page-bg py-10">
      <div className="flex flex-col justify-center items-center mb-8">
        <h1 className="bg-clip-text text-transparent bg-linear-to-r from-[#2E1A47] to-[#D80032] dark:from-cyan-500 dark:to-pink-500 text-4xl sm:text-5xl font-bold text-center leading-relaxed">Privacy Policy</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Last Updated: May 2026</p>
      </div>

      <div className="m-auto w-full max-w-3xl rounded-4xl border border-slate-200/70 bg-white/60 dark:bg-slate-900/60 p-8 shadow-[0_28px_70px_rgba(15,18,28,0.12)] backdrop-blur-xl">
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">Introduction</h2>
          <p className="text-sm text-slate-700 dark:text-slate-300">Your privacy is important to us. This Privacy Policy explains how we collect, use, store, and protect your information when you use the Expense Tracker application. By using the application, you agree to the practices described in this Privacy Policy.</p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">Information We Collect</h2>
          <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">Account Information</p>
          <p className="text-sm text-slate-700 dark:text-slate-300">When you create an account, we may collect:</p>
          <ul className="list-disc pl-5 mt-2 text-sm text-slate-700 dark:text-slate-300">
            <li>Name</li>
            <li>Email address</li>
            <li>Password (stored securely in encrypted or hashed form)</li>
          </ul>

          <p className="text-sm text-slate-700 dark:text-slate-300 mt-4 mb-2">Financial Information</p>
          <p className="text-sm text-slate-700 dark:text-slate-300">To provide expense tracking services, we collect information that you choose to enter, including:</p>
          <ul className="list-disc pl-5 mt-2 text-sm text-slate-700 dark:text-slate-300">
            <li>Expense amounts</li>
            <li>Categories</li>
            <li>Transaction dates</li>
            <li>Notes and descriptions</li>
            <li>Budget settings</li>
          </ul>

          <p className="text-sm text-slate-700 dark:text-slate-300 mt-4 mb-2">Technical Information</p>
          <p className="text-sm text-slate-700 dark:text-slate-300">We may automatically collect:</p>
          <ul className="list-disc pl-5 mt-2 text-sm text-slate-700 dark:text-slate-300">
            <li>Browser type</li>
            <li>Device information</li>
            <li>IP address</li>
            <li>Login timestamps</li>
            <li>Usage statistics</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">How We Use Your Information</h2>
          <p className="text-sm text-slate-700 dark:text-slate-300">We use your information to:</p>
          <ul className="list-disc pl-5 mt-2 text-sm text-slate-700 dark:text-slate-300">
            <li>Create and manage your account.</li>
            <li>Track and organize your expenses.</li>
            <li>Generate financial insights and reports.</li>
            <li>Improve application performance and user experience.</li>
            <li>Provide customer support.</li>
            <li>Maintain security and prevent unauthorized access.</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">Data Storage and Security</h2>
          <p className="text-sm text-slate-700 dark:text-slate-300">We implement reasonable security measures to protect your personal information from unauthorized access, disclosure, or modification. These measures may include:</p>
          <ul className="list-disc pl-5 mt-2 text-sm text-slate-700 dark:text-slate-300">
            <li>Password hashing</li>
            <li>Secure authentication mechanisms</li>
            <li>Protected database access</li>
            <li>Encrypted communication channels where applicable</li>
          </ul>
          <p className="text-sm text-slate-700 dark:text-slate-300 mt-2">While we strive to protect your information, no method of electronic storage or transmission is completely secure.</p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">Data Sharing</h2>
          <p className="text-sm text-slate-700 dark:text-slate-300">We do not sell, rent, or trade your personal information to third parties. Your information may only be shared:</p>
          <ul className="list-disc pl-5 mt-2 text-sm text-slate-700 dark:text-slate-300">
            <li>When required by law.</li>
            <li>To comply with legal obligations.</li>
            <li>To protect the security and integrity of the application.</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">Cookies and Authentication</h2>
          <p className="text-sm text-slate-700 dark:text-slate-300">The application may use cookies or similar technologies to maintain user sessions, authenticate users securely, and improve overall functionality. These cookies do not contain sensitive financial information.</p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">Data Retention</h2>
          <p className="text-sm text-slate-700 dark:text-slate-300">We retain your information for as long as your account remains active or as necessary to provide the services offered by the application. You may request account deletion, after which reasonable efforts will be made to remove your personal data from our systems.</p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">Your Rights</h2>
          <p className="text-sm text-slate-700 dark:text-slate-300">You have the right to:</p>
          <ul className="list-disc pl-5 mt-2 text-sm text-slate-700 dark:text-slate-300">
            <li>Access your stored information.</li>
            <li>Update or correct inaccurate information.</li>
            <li>Delete your account and associated data.</li>
            <li>Request information about how your data is being used.</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">Third-Party Services</h2>
          <p className="text-sm text-slate-700 dark:text-slate-300">The application may use third-party services such as hosting providers, analytics tools, or authentication services. These services may process data according to their own privacy policies. We encourage users to review the privacy policies of any third-party services used by the application.</p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">Children's Privacy</h2>
          <p className="text-sm text-slate-700 dark:text-slate-300">This application is not intended for children under the age of 13. We do not knowingly collect personal information from children.</p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">Changes to This Privacy Policy</h2>
          <p className="text-sm text-slate-700 dark:text-slate-300">We may update this Privacy Policy from time to time. Any changes will be posted on this page along with the updated revision date. Continued use of the application after changes are posted constitutes acceptance of the updated Privacy Policy.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">Contact Us</h2>
          <p className="text-sm text-slate-700 dark:text-slate-300">If you have any questions, concerns, or requests regarding this Privacy Policy, please contact us through the application's support or feedback section.</p>
        </section>
      </div>
    </div>
  )
}