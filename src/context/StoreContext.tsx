import React, { createContext, useContext, useState, useEffect } from 'react';
import { Categoria, Cookie, ConfigSite, FaqItem, FaixaFrete } from '../types';
import { StoreService, inicializarArmazenamento } from '../services/store';

interface StoreContextType {
  cookies: Cookie[];
  categorias: Categoria[];
  config: ConfigSite;
  faqs: FaqItem[];
  faixasFrete: FaixaFrete[];
  carregando: boolean;
  recarregarDados: () => Promise<void>;
  atualizarDisponibilidadeCookie: (id: string, disponivel: boolean) => Promise<void>;
  atualizarTodosCookiesDisponibilidade: (disponivel: boolean) => Promise<void>;
  salvarCookie: (cookie: Cookie) => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cookies, setCookies] = useState<Cookie[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [config, setConfig] = useState<ConfigSite>({} as ConfigSite);
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [faixasFrete, setFaixasFrete] = useState<FaixaFrete[]>([]);
  const [carregando, setCarregando] = useState(true);

  const carregarDados = async () => {
    inicializarArmazenamento();
    const [c, cat, cfg, f, fx] = await Promise.all([
      StoreService.getCookies(),
      StoreService.getCategorias(),
      StoreService.getConfig(),
      StoreService.getFaq(),
      StoreService.getFaixasFrete(),
    ]);

    setCookies(c);
    setCategorias(cat);
    setConfig(cfg);
    setFaqs(f);
    setFaixasFrete(fx);
    setCarregando(false);
  };

  useEffect(() => {
    carregarDados();

    const handleStorageUpdate = () => {
      carregarDados();
    };

    window.addEventListener('gabi_storage_updated', handleStorageUpdate);
    return () => {
      window.removeEventListener('gabi_storage_updated', handleStorageUpdate);
    };
  }, []);

  const atualizarDisponibilidadeCookie = async (id: string, disponivel: boolean) => {
    await StoreService.setCookieDisponibilidade(id, disponivel);
    setCookies((prev) => prev.map((c) => (c.id === id ? { ...c, disponivel_hoje: disponivel } : c)));
  };

  const atualizarTodosCookiesDisponibilidade = async (disponivel: boolean) => {
    await StoreService.setAllCookiesDisponibilidade(disponivel);
    setCookies((prev) => prev.map((c) => ({ ...c, disponivel_hoje: disponivel })));
  };

  const salvarCookie = async (cookie: Cookie) => {
    await StoreService.salvarCookie(cookie);
    await carregarDados();
  };

  return (
    <StoreContext.Provider
      value={{
        cookies,
        categorias,
        config,
        faqs,
        faixasFrete,
        carregando,
        recarregarDados: carregarDados,
        atualizarDisponibilidadeCookie,
        atualizarTodosCookiesDisponibilidade,
        salvarCookie,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore deve ser usado dentro de um StoreProvider');
  }
  return context;
};
