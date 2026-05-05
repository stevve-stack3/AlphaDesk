export default function Footer() {
  return (
    <footer className="app-footer">
      <span className="footer-powered">
        Powered by{' '}
        <a href="https://bds.birdeye.so" target="_blank" rel="noopener noreferrer">
          Birdeye Data
        </a>
      </span>
      <span className="footer-sep">&middot;</span>
      <a href="https://github.com/stevve-stack3/AlphaDesk" target="_blank" rel="noopener noreferrer" className="footer-link">
        GitHub
      </a>
      <span className="footer-sep">&middot;</span>
      <span className="footer-shortcuts">Press ? for shortcuts</span>
    </footer>
  );
}
