import React, { createContext, useContext, useState, useEffect } from 'react';
import { Perfil, Role } from '../types';
import { StoreService } from '../services/store';

interface AuthContextType {
  perfil: Perfil;
  isAdmin: boolean;
  setRole: (role: Role) => void;
  atualizarDadosPerfil: (nome: string, whatsapp: string, email?: string) => Promise<void>;
  adicionarEndereco: (endereco: any) => Promise<void>;
  recarregarPerfil: () => Promise<void>;
}

const DEFAULT_CLIENTE: Perfil = {
  id: 'usr_cliente_demo',
  nome: 'Lucas Silveira',
  whatsapp: '51988887777',
  email: 'lucas.unisinos@gmail.com',
  enderecos: [
    {
      cep: '93022-714',
      logradouro: 'Av. Unisinos',
      numero: '950',
      bairro: 'Cristo Rei',
      cidade: 'São Leopoldo',
      complemento: 'Portão B - Florindas',
      distancia_km: 0,
    }
  ],
  role: 'cliente',
  saldo_pontos: 15, // Já começa com 15 pontos de boas-vindas para testar desconto
  dias_fidelidade: 8, // Já no dia 8 para o usuário testar a barra e ver que faltam 2
  cookies_gratis_disponiveis: 1, // 1 cookie grátis já liberado para testar resgate!
};

const DEFAULT_ADMIN: Perfil = {
  id: 'usr_gabi_admin',
  nome: 'Gabi (Confeiteira & Admin)',
  whatsapp: '51999999999',
  email: 'gabi@gabicookies.com.br',
  enderecos: [],
  role: 'admin',
  saldo_pontos: 0,
  dias_fidelidade: 0,
  cookies_gratis_disponiveis: 0,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [perfil, setPerfil] = useState<Perfil>(() => {
    const saved = localStorage.getItem('gabi_current_profile');
    return saved ? JSON.parse(saved) : DEFAULT_CLIENTE;
  });

  useEffect(() => {
    localStorage.setItem('gabi_current_profile', JSON.stringify(perfil));
    StoreService.salvarPerfil(perfil);
  }, [perfil]);

  const recarregarPerfil = async () => {
    const atualizado = await StoreService.getPerfil(perfil.id);
    if (atualizado) {
      setPerfil(atualizado);
    }
  };

  const setRole = (role: Role) => {
    if (role === 'admin') {
      setPerfil(DEFAULT_ADMIN);
    } else {
      setPerfil(DEFAULT_CLIENTE);
    }
  };

  const atualizarDadosPerfil = async (nome: string, whatsapp: string, email?: string) => {
    const atualizado: Perfil = {
      ...perfil,
      nome,
      whatsapp,
      email,
    };
    setPerfil(atualizado);
    await StoreService.salvarPerfil(atualizado);
  };

  const adicionarEndereco = async (endereco: any) => {
    const atualizado: Perfil = {
      ...perfil,
      enderecos: [endereco, ...perfil.enderecos],
    };
    setPerfil(atualizado);
    await StoreService.salvarPerfil(atualizado);
  };

  return (
    <AuthContext.Provider
      value={{
        perfil,
        isAdmin: perfil.role === 'admin',
        setRole,
        atualizarDadosPerfil,
        adicionarEndereco,
        recarregarPerfil,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
