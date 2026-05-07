import type { Metadata } from 'next';
import { AppShell } from '@/components/layout/AppShell';

export const metadata: Metadata = {
  title: 'Cookie Policy | (t)ext',
  description: 'Privacy and cookie policy for (t)ext editor.'
};

export default function CookiesPage() {
  return (
    <AppShell>
      <div className="min-h-screen">
        <header className="border-b border-[var(--color-border)] px-5 py-8 md:px-8">
          <div className="max-w-3xl mx-auto">
            <h1 className="font-content text-4xl font-normal text-[var(--color-text)]">Cookie Policy</h1>
          </div>
        </header>

        <main className="px-5 py-12 md:px-8">
          <article className="max-w-3xl mx-auto space-y-10">
            <section className="space-y-4">
              <p className="font-ui text-base leading-7 text-[var(--color-text-soft)]">
                This policy describes how <strong>(t)ext</strong> handles personal data and uses cookies or equivalent tools while you use the app.{' '}
                <strong>(t)ext</strong> is a Markdown editor that works locally: your content stays on your device.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-content text-xl font-bold text-[var(--color-text)]">Data Controller</h2>
              <p className="font-ui text-sm leading-6 text-[var(--color-text-soft)]">
                The data controller is <strong>Renato Caputo</strong> ("Controller"). You can reach the Controller via the contact details provided in the app or on the reference website.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-content text-xl font-bold text-[var(--color-text)]">Data Processed</h2>
              <ul className="list-disc pl-5 space-y-2 font-ui text-sm leading-6 text-[var(--color-text-soft)]">
                <li><strong>Content and documents:</strong> text, titles, and notes you create in the editor.</li>
                <li><strong>Technical data:</strong> minimal information required for the app to function (e.g. preferences and app state).</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="font-content text-xl font-bold text-[var(--color-text)]">Where Data is Stored</h2>
              <p className="font-ui text-sm leading-6 text-[var(--color-text-soft)]">
                <strong>(t)ext</strong> saves documents locally on your device using browser storage (localStorage). The Controller does not receive or store your content on remote servers.
              </p>
              <p className="font-ui text-sm leading-6 text-[var(--color-text-soft)]">
                When using Import or Export, files are read or written on your computer via standard browser download/upload.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-content text-xl font-bold text-[var(--color-text)]">Cookies and Equivalent Tools</h2>
              <p className="font-ui text-sm leading-6 text-[var(--color-text-soft)]">
                <strong>(t)ext</strong> does not use profiling cookies or tracking tools. Only technical tools (such as localStorage) are used to:
              </p>
              <ul className="list-disc pl-5 space-y-2 font-ui text-sm leading-6 text-[var(--color-text-soft)]">
                <li>store documents and the last app state;</li>
                <li>improve experience stability (e.g. prevent content loss).</li>
              </ul>
              <p className="font-ui text-sm leading-6 text-[var(--color-text-soft)]">
                You can delete this data at any time by clearing site data from your browser settings.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-content text-xl font-bold text-[var(--color-text)]">Legal Basis</h2>
              <p className="font-ui text-sm leading-6 text-[var(--color-text-soft)]">
                Processing is based on the performance of the requested service (providing the editor and saving documents locally) and, where applicable, on the Controller's legitimate interest in ensuring security and correct operation.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-content text-xl font-bold text-[var(--color-text)]">Sharing and Transfers</h2>
              <p className="font-ui text-sm leading-6 text-[var(--color-text-soft)]">
                The Controller does not share your content with third parties, as it is never sent to any server. The hosting provider may collect technical logs (e.g. IP address, user agent) for security and performance purposes — such data is handled by the provider under their own policy.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-content text-xl font-bold text-[var(--color-text)]">Retention</h2>
              <p className="font-ui text-sm leading-6 text-[var(--color-text-soft)]">
                Documents remain on your device until you delete them from the app or clear your browser data.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-content text-xl font-bold text-[var(--color-text)]">Your Rights</h2>
              <p className="font-ui text-sm leading-6 text-[var(--color-text-soft)]">
                Under the GDPR, you have the right to access, rectify, erase, restrict, object to, and port your data, to the extent applicable. To exercise these rights, contact the Controller via the details provided in the app or on the reference website.
              </p>
            </section>

            <section className="pt-8 border-t border-[var(--color-border)]">
              <p className="font-ui text-[10px] uppercase tracking-widest text-[var(--color-text-faint)]">
                Last updated: May 2026
              </p>
            </section>
          </article>
        </main>
      </div>
    </AppShell>
  );
}
