import { useState, useEffect } from 'react';
import LandingPage from './pages/LandingPage';
import ErpApp from './ErpApp';

type AppMode = 'landing' | 'app';

function getModeFromHash(): AppMode {
  return window.location.hash === '#app' ? 'app' : 'landing';
}

export default function App() {
  const [mode, setMode] = useState<AppMode>(getModeFromHash);

  useEffect(() => {
    const onHashChange = () => setMode(getModeFromHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const enterApp = () => {
    window.location.hash = 'app';
    setMode('app');
  };

  const goHome = () => {
    window.location.hash = '';
    setMode('landing');
    window.scrollTo({ top: 0 });
  };

  if (mode === 'landing') {
    return <LandingPage onLaunchApp={enterApp} />;
  }

  return <ErpApp onHome={goHome} />;
}
