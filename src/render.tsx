import { StrictMode, Suspense } from 'react';
import App from './pages/App';
import { createRoot } from 'react-dom/client';
import { WagmiContextProvider } from './context/wagmi';

export default function render() {
  const container = document.querySelector('#root');
  if (container) {
    const root = createRoot(container);
    root.render(
      <StrictMode>
        <Suspense fallback={null}>
          <WagmiContextProvider>
            <App />
          </WagmiContextProvider>
        </Suspense>
      </StrictMode>
    );
  }
}
