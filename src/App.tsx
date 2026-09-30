import { useEffect, useRef, useState } from 'react';
import { navigation } from './data/site';
import { Wordmark } from './components/Wordmark';
import { OpeningIntro } from './components/OpeningIntro';
import { CampusFlow } from './components/CampusFlow';
import { Hero } from './components/Hero';
import { StepRail } from './components/StepRail';
import { PathwayList } from './components/PathwayList';
import { MentorshipForm } from './components/MentorshipForm';
import { useOpeningIntro } from './hooks/useOpeningIntro';

function SectionLabel({ number, children }: { number: string; children: React.ReactNode }) {
  return (
    <div className="section-label">
      <span>
        {number} / {children}
      </span>
      <span aria-hidden="true">↘</span>
    </div>
  );
}

export default function App() {
  const [paused, setPaused] = useState(false);
  const [active, setActive] = useState('home');
  const [formOpen, setFormOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const formDialog = useRef<HTMLDialogElement>(null);
  const privacyDialog = useRef<HTMLDialogElement>(null);
  const { opening, finish } = useOpeningIntro('/');
  useEffect(() => {
    const sections = navigation
      .map((item) => document.getElementById(item.id))
      .filter((node): node is HTMLElement => !!node);
    let frame = 0;
    const update = () => {
      frame = 0;
      const boundary =
        (document.querySelector('header')?.getBoundingClientRect().height ?? 84) +
        Math.min(window.innerHeight * 0.2, 180);
      const current = sections.filter((section) => section.getBoundingClientRect().top <= boundary).slice(-1)[0];
      setActive(current?.id ?? 'home');
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    schedule();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, []);
  useEffect(() => {
    if (formOpen) formDialog.current?.showModal();
    else formDialog.current?.close();
  }, [formOpen]);
  useEffect(() => {
    if (privacyOpen) privacyDialog.current?.showModal();
    else privacyDialog.current?.close();
  }, [privacyOpen]);
  useEffect(() => {
    if (!formOpen && !privacyOpen) return;
    const before = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = before;
    };
  }, [formOpen, privacyOpen]);
  return (
    <div className="site-chrome" data-opening={opening ? 'playing' : 'done'}>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      {opening && <OpeningIntro onSkip={finish} />}
      <header className="header">
        <a href="#home" className="header-brand" aria-label="Admission Possible home">
          <Wordmark />
        </a>
        <nav aria-label="Main navigation">
          {navigation.map((item, i) => (
            <a key={item.id} href={`#${item.id}`} aria-current={active === item.id ? 'location' : undefined}>
              <span>0{i + 1}/</span>
              {item.label}
            </a>
          ))}
        </nav>
      </header>
      <main id="main-content" className="home" tabIndex={-1}>
        <Hero
          paused={paused}
          opening={opening}
          onToggleMotion={() => setPaused((value) => !value)}
          onJoin={() => setFormOpen(true)}
        />

        <section id="about" className="section about" aria-labelledby="about-title">
          <SectionLabel number="02">ABOUT US</SectionLabel>
          <div className="about-grid">
            <h2 id="about-title">
              By first-gen students.
              <br />
              For <span className="accent">the next ones.</span>
            </h2>
            <div className="about-copy">
              <p className="lead">
                You don’t have to figure
                <br className="desktop-break" /> it all out alone.
              </p>
              <p>
                We’ve been there: the forms, the essays, the deadlines nobody at home could explain. Now we’re making
                that path a little clearer for the students coming next.
              </p>
              <p>
                (Ad)mission Possible connects you with a mentor who meets you where you are—and helps you move toward
                where you want to be.
              </p>
              <a href="#how-it-works" className="text-cta">
                A little guidance goes a long way <span aria-hidden="true">↘</span>
              </a>
            </div>
          </div>
          <div className="about-foot">
            <span>YOUR STORY. YOUR DIRECTION.</span>
            <p>Your future is more than a college acceptance letter.</p>
          </div>
        </section>

        <section id="how-it-works" className="section process" aria-label="How It Works">
          <SectionLabel number="03">HOW IT WORKS</SectionLabel>
          <StepRail />
        </section>

        <section id="what-we-offer" className="section offer" aria-labelledby="offer-title">
          <SectionLabel number="04">WHAT WE OFFER</SectionLabel>
          <div className="offer-heading">
            <h2 id="offer-title">
              Big possibilities.
              <br />
              <span className="accent">Personal guidance.</span>
            </h2>
            <p>
              A mentor in your corner. A college list that fits. An essay in your voice. Support through the details,
              and the decisions that come next.
            </p>
          </div>
          <div className="offer-services">
            <span>01 / ONE-ON-ONE MENTORSHIP</span>
            <span>02 / COLLEGE & APPLICATION GUIDANCE</span>
            <span>03 / ESSAYS & SCHOLARSHIP SUPPORT</span>
          </div>
          <div className="pathway-intro">
            <h3>Different applications. One place to start.</h3>
            <span>
              EXPLORE YOUR PATHWAY <span aria-hidden="true">↓</span>
            </span>
          </div>
          <PathwayList />
          <p className="pathway-note">Guidance across the systems you’ll use.</p>
        </section>

        <section id="join" className="join-section" aria-labelledby="join-title">
          <SectionLabel number="05">JOIN US</SectionLabel>
          <div className="join-copy">
            <p>Let’s make admission possible.</p>
            <h2 id="join-title">
              Your next chapter
              <br />
              starts <span>with you.</span>
            </h2>
            <button className="join-button" onClick={() => setFormOpen(true)}>
              Find my mentor <span aria-hidden="true">↗</span>
            </button>
            <p className="join-note">
              Tell us a little about yourself.
              <br />
              We’ll use your story, goals, and availability to find the right fit.
            </p>
          </div>
          <CampusFlow arc paused={paused} />
        </section>
      </main>
      <footer className="footer">
        <a href="#home" className="footer-wordmark" aria-label="Admission Possible, back to top">
          <Wordmark large />
        </a>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} (Ad)mission Possible</p>
          <div>
            <a href="https://www.instagram.com/admission.possible/" target="_blank" rel="noopener noreferrer">
              Instagram ↗
            </a>
            <a href="https://www.linkedin.com/company/ad-mission-possible/" target="_blank" rel="noopener noreferrer">
              LinkedIn ↗
            </a>
            <button onClick={() => setPrivacyOpen(true)}>Privacy & credits</button>
            <a href="#home">Back to top ↑</a>
          </div>
        </div>
      </footer>
      <dialog
        ref={formDialog}
        className="intake-dialog"
        aria-label="Student mentorship application"
        onCancel={() => setFormOpen(false)}
        onClose={() => setFormOpen(false)}
      >
        <div className="dialog-toolbar">
          <span>(Ad)mission Possible / JOIN US</span>
          <button onClick={() => setFormOpen(false)} aria-label="Close mentorship form">
            Close <span aria-hidden="true">×</span>
          </button>
        </div>
        {formOpen && <MentorshipForm onClose={() => setFormOpen(false)} />}
      </dialog>
      <dialog
        ref={privacyDialog}
        className="privacy-dialog"
        aria-labelledby="privacy-title"
        onCancel={() => setPrivacyOpen(false)}
        onClose={() => setPrivacyOpen(false)}
      >
        <div className="dialog-toolbar">
          <span>THE DETAILS</span>
          <button onClick={() => setPrivacyOpen(false)} aria-label="Close privacy and credits">
            Close ×
          </button>
        </div>
        <h2 id="privacy-title">Your story stays yours.</h2>
        <p>
          Your application details are sent to the Admission Possible team to contact you and help match you with a
          mentor. Only share information you’re comfortable having the team review. You don’t need to include financial
          records, identity documents, or other sensitive files.
        </p>
        <p>
          Form answers remain in memory while this form is open. Closing it clears your answers. Nothing is sent until
          you submit. If delivery fails, you can download a copy of your answers and try again.
        </p>
        <p>
          To request a correction or deletion after submitting, reply to the team’s follow-up email. This site does not
          use advertising trackers. Campus and application logos belong to their respective institutions and do not
          represent endorsements.
        </p>
        <h3>Photography & design</h3>
        <p>
          Campus photography and university marks are carried over from the two Admission Possible websites, with
          additional high-resolution photography credited in the asset register. Typography: the existing Beausite
          family. Design references:{' '}
          <a href="https://www.designisfunny.co/" target="_blank" rel="noopener noreferrer">
            Design is Funny
          </a>{' '}
          and editorial work featured on{' '}
          <a href="https://www.awwwards.com/websites/minimal/" target="_blank" rel="noopener noreferrer">
            Awwwards
          </a>
          .
        </p>
        <a className="text-cta" href="/image-credits.html" target="_blank" rel="noopener noreferrer">
          View image credits ↗
        </a>
      </dialog>
    </div>
  );
}
