export default function TermsOfUse() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-8">Terms of Use</h1>
      
      <div className="prose prose-gray">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
          <p className="mb-4">
            By accessing and using this application, you accept and agree to be bound 
            by the terms and conditions of this agreement.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Your Data</h2>
          <p className="mb-4">
            PomoTime does not use accounts. Your workspaces, tasks and settings are
            stored only in your browser&apos;s local storage. You are responsible
            for that data: it is not backed up, and it is lost if you clear your
            browser&apos;s site data. We cannot recover it.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. Acceptable Use</h2>
          <p className="mb-4">
            You agree not to:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Use the service for any illegal purpose</li>
            <li>Attempt to gain unauthorized access to any portion of the service</li>
            <li>Interfere with or disrupt the service</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Termination</h2>
          <p className="mb-4">
            We reserve the right to suspend or discontinue the service, or restrict
            access to it, at any time for any reason without notice.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Changes to Terms</h2>
          <p className="mb-4">
            We reserve the right to modify these terms at any time. We will notify
            users of any material changes through the application.
          </p>
        </section>

        <p className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>
    </div>
  )
} 