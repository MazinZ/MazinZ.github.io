import { ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MovingArtwork from './moving-artwork';

export default function Home() {
  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <div className="site-shell">
        <main id="main">
          <section className="introduction" aria-labelledby="name">
            <h1 id="name"><span>Hi, I’m</span> <span>Mazin.</span></h1>
            <p className="current-role">Currently Senior Software Engineer @ <strong>Meta.</strong></p>
            <MovingArtwork />
          </section>
          <section className="biography" aria-label="About Mazin">
            <div className="main-bio">
              <p>Most of my work is on the web: building user interfaces for products used by billions of people, optimizing performance, and helping other engineers do the same.</p>
            </div>
            <div className="more-bio">
              <p>I’ve been at Meta since 2021. Before that, I worked at Swing Education and Fooji.</p>
              <p>I enjoy mentoring other engineers and learning from the people I work with. Lately, I’ve been learning more about AI, with an interest in mechanistic interpretability.</p>
            </div>
            <nav className="contact-links" aria-label="Contact and résumé">
              <Button className="contact-button email-button" nativeButton={false} render={<a href="mailto:mazinzakaria1@gmail.com" />}>Email <ArrowUpRight size={17} aria-hidden="true" /></Button>
              <Button className="contact-button resume-link" variant="outline" nativeButton={false} render={<a href="/Mazin-Zakaria-Resume.pdf" target="_blank" rel="noopener noreferrer" />}>Résumé <span>(PDF)</span> <ArrowUpRight size={17} aria-hidden="true" /><span className="sr-only"> — opens in a new tab</span></Button>
            </nav>
          </section>
        </main>
        <footer className="site-footer">
          <nav aria-label="Social profiles">
            <a href="https://www.linkedin.com/in/mazinzakaria" target="_blank" rel="noopener noreferrer">LinkedIn <ArrowUpRight size={15} aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></a>
            <a href="https://github.com/MazinZ" target="_blank" rel="noopener noreferrer">GitHub <ArrowUpRight size={15} aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></a>
          </nav>
        </footer>
      </div>
    </>
  );
}
