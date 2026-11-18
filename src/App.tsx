import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { StoreProvider } from './context/StoreContext';
import { CartProvider } from './context/CartContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { WhatsappCustomOrderModal } from './components/WhatsappCustomOrderModal';
import { CookieDetailModal } from './components/CookieDetailModal';
import { HomePage } from './pages/HomePage';
import { MenuPage } from './pages/MenuPage';
import { KitBuilderPage } from './pages/KitBuilderPage';
import { CartPage } from './pages/CartPage';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage';
import { AccountPage } from './pages/AccountPage';
import { AboutFaqPage } from './pages/AboutFaqPage';
import { AdminPage } from './pages/admin/AdminPage';
import { Cookie } from './types';

// Scroll to top automatically when route changes
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function MainLayout() {
  const [modalWhatsappAberto, setModalWhatsappAberto] = useState(false);
  const [cookieSelecionado, setCookieSelecionado] = useState<Cookie | null>(null);

  return (
    <div className="min-h-screen flex flex-col bg-cookie-50 text-cookie-950 font-sans selection:bg-amber-200">
      <ScrollToTop />
      
      {/* Barra de Navegação */}
      <Navbar onOpenWhatsappModal={() => setModalWhatsappAberto(true)} />

      {/* Conteúdo Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                onSelectCookie={(c) => setCookieSelecionado(c)}
                onOpenWhatsappModal={() => setModalWhatsappAberto(true)}
              />
            }
          />
          <Route
            path="/cardapio"
            element={
              <MenuPage
                onSelectCookie={(c) => setCookieSelecionado(c)}
              />
            }
          />
          <Route path="/monte-seu-kit" element={<KitBuilderPage />} />
          <Route path="/carrinho" element={<CartPage />} />
          <Route path="/pedido/:id" element={<OrderConfirmationPage />} />
          <Route path="/minha-conta" element={<AccountPage />} />
          <Route
            path="/sobre-faq"
            element={<AboutFaqPage onOpenWhatsappModal={() => setModalWhatsappAberto(true)} />}
          />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </main>

      {/* Rodapé */}
      <Footer onOpenWhatsappModal={() => setModalWhatsappAberto(true)} />

      {/* Modal de Pedido Personalizado no WhatsApp */}
      <WhatsappCustomOrderModal
        aberto={modalWhatsappAberto}
        onClose={() => setModalWhatsappAberto(false)}
      />

      {/* Modal de Detalhes do Cookie */}
      <CookieDetailModal
        cookie={cookieSelecionado}
        onClose={() => setCookieSelecionado(null)}
        onOpenWhatsapp={() => setModalWhatsappAberto(true)}
      />
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <StoreProvider>
        <CartProvider>
          <Router>
            <MainLayout />
          </Router>
        </CartProvider>
      </StoreProvider>
    </AuthProvider>
  );
}

export default App;
