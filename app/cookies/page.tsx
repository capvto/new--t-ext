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
                Questa informativa descrive come <strong>(t)ext</strong> tratta i dati personali e come utilizza cookie o strumenti equivalenti durante l'uso dell'app. 
                <strong>(t)ext</strong> è un editor di Markdown che funziona in locale: i contenuti restano sul tuo dispositivo.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-content text-xl font-bold text-[var(--color-text)]">Titolare del trattamento</h2>
              <p className="font-ui text-sm leading-6 text-[var(--color-text-soft)]">
                Il titolare del trattamento è <strong>Renato Caputo</strong> ("Titolare"). Puoi contattare il Titolare tramite i contatti indicati nell'app o sul sito di riferimento.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-content text-xl font-bold text-[var(--color-text)]">Dati trattati</h2>
              <ul className="list-disc pl-5 space-y-2 font-ui text-sm leading-6 text-[var(--color-text-soft)]">
                <li><strong>Contenuti e documenti:</strong> testo, titoli e note che crei nell'editor.</li>
                <li><strong>Dati tecnici:</strong> informazioni minime necessarie al funzionamento (ad esempio preferenze e stato dell'app).</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="font-content text-xl font-bold text-[var(--color-text)]">Dove vengono salvati i dati</h2>
              <p className="font-ui text-sm leading-6 text-[var(--color-text-soft)]">
                <strong>(t)ext</strong> salva i documenti in locale sul tuo dispositivo utilizzando la memoria del browser (localStorage) o lo storage equivalente in Electron. Il Titolare non riceve né conserva i tuoi contenuti su server remoti.
              </p>
              <p className="font-ui text-sm leading-6 text-[var(--color-text-soft)]">
                Se usi le funzioni di Import o Export, i file vengono letti/scritti sul tuo computer tramite i normali strumenti del sistema operativo (se stai usando la versione Electron) o tramite download/upload del browser.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-content text-xl font-bold text-[var(--color-text)]">Cookie e strumenti equivalenti</h2>
              <p className="font-ui text-sm leading-6 text-[var(--color-text-soft)]">
                <strong>(t)ext</strong> non usa cookie di profilazione né strumenti di tracciamento. Vengono usati solo strumenti tecnici (come localStorage) per:
              </p>
              <ul className="list-disc pl-5 space-y-2 font-ui text-sm leading-6 text-[var(--color-text-soft)]">
                <li>memorizzare i documenti e l'ultimo stato dell'app;</li>
                <li>migliorare la stabilità dell'esperienza (ad esempio evitare perdite di contenuto).</li>
              </ul>
              <p className="font-ui text-sm leading-6 text-[var(--color-text-soft)]">
                Puoi cancellare questi dati in qualsiasi momento eliminando i dati del sito/app dalle impostazioni del tuo browser o del sistema.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-content text-xl font-bold text-[var(--color-text)]">Base giuridica</h2>
              <p className="font-ui text-sm leading-6 text-[var(--color-text-soft)]">
                Il trattamento è basato sull'esecuzione del servizio richiesto (fornire l'editor e salvare in locale i documenti) e, ove applicabile, sul legittimo interesse del Titolare a garantire sicurezza e corretto funzionamento.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-content text-xl font-bold text-[var(--color-text)]">Condivisione e trasferimenti</h2>
              <p className="font-ui text-sm leading-6 text-[var(--color-text-soft)]">
                Il Titolare non condivide i tuoi contenuti con terze parti perché non vengono inviati a server. Se utilizzi la versione web, il provider di hosting potrebbe raccogliere log tecnici (es. IP, user-agent) per motivi di sicurezza e prestazioni: tali dati sono gestiti dal provider secondo le proprie policy.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-content text-xl font-bold text-[var(--color-text)]">Conservazione</h2>
              <p className="font-ui text-sm leading-6 text-[var(--color-text-soft)]">
                I documenti restano sul tuo dispositivo finché non li cancelli dall'app o finché non elimini i dati del browser/app.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-content text-xl font-bold text-[var(--color-text)]">Diritti dell'interessato</h2>
              <p className="font-ui text-sm leading-6 text-[var(--color-text-soft)]">
                In base al GDPR, hai diritto di ottenere accesso, rettifica, cancellazione, limitazione, opposizione e portabilità dei dati, nei limiti applicabili. Per esercitare i diritti puoi contattare il Titolare tramite i contatti indicati nell'app o sul sito di riferimento.
              </p>
            </section>

            <section className="pt-8 border-t border-[var(--color-border)]">
              <p className="font-ui text-[10px] uppercase tracking-widest text-[var(--color-text-faint)]">
                Ultimo aggiornamento: Maggio 2026
              </p>
            </section>
          </article>
        </main>
      </div>
    </AppShell>
  );
}
