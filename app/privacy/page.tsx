export default function PrivacyPolicy() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
      
      <div className="prose prose-gray">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
          <p className="mb-4">
            PomoTime does not require an account and does not collect your name,
            email address or any other personal details. The workspaces, tasks and
            timer settings you create are never sent to our servers.
          </p>
          <p className="mb-4">
            We use Vercel Analytics and Vercel Speed Insights to collect anonymous,
            aggregated usage and performance data (such as page views and load
            times) so we can improve the app.
          </p>
          <p className="mb-4">
            If you contact us for support, we receive the information you choose to
            include in your message.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
          <p className="mb-4">
            We use the information we collect to:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Provide, maintain, and improve our services</li>
            <li>Respond to your comments and questions</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Data Storage</h2>
          <p className="mb-4">
            Your workspaces, tasks and timer settings are stored only in your
            browser&apos;s local storage on your device. They are not synced between
            browsers or devices, and we cannot access or recover them.
          </p>
          <p className="mb-4">
            Clearing your browser&apos;s site data, or using a private/incognito
            window, will permanently remove this data.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
          <p className="mb-4">
            If you have any questions about this Privacy Policy, please contact us at:
            [Your Contact Information]
          </p>
        </section>

        <p className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>
    </div>
  )
} 