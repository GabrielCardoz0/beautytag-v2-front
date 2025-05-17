import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Tipos para Checkins
interface CheckinRequest {
  data: {
    hash: string;
    estado: string;
    telefone: string;
    servico: string;
    data_reservada: string; // formato: date
    data_inicio?: string; // formato: date-time
    data_fim?: string; // formato: date-time
    locale?: string;
    localizations?: (number | string)[];
  };
}

interface UpdateCheckinRequest {
  data: {
    estado: string;
    telefone: string;
    servico: string;
    data_reservada: string; // formato: date
    data_inicio?: string; // formato: date-time
    data_fim?: string;
  };
}

// Tipos para Formularios
interface FormularioRequest {
  data: {
    nome: string;
    descricao: string;
    formulario_opcaos?: (number | string)[]; // novo campo
    locale?: string;
    localizations?: (number | string)[];
  };
}

// Tipos para Planos
interface PlanoRequest {
  data: {
    users_permissions_user?: number | string;
    is_pago?: boolean;
    plano_servico?: number | string;
    locale?: string;
    localizations?: (number | string)[];
  };
}

// Tipos para PlanoServicos
interface PlanoServicoRequest {
  data: {
    planos?: (number | string)[];
    frequencia: string;
    frequencia_value: number;
    servico: number | string;
    locale?: string;
    localizations?: (number | string)[];
  };
}

// Tipos para Serviços
interface ServicoRequest {
  data: {
    name: string;
    descricao: string;
    preco: number;
    percent_colab?: number;
    percent_repasse?: number;
    preco_colab?: number;
    preco_parceiro?: number;
    lucro?: number;
    genero?: string;
    users_permissions_user?: number | string;
    plano_servicos?: (number | string)[];
    formulario_opcao?: number | string; // novo campo
    formulario_opcao_secundario?: number | string; // novo campo
    locale?: string;
    localizations?: (number | string)[];
  };
}

// Tipos para FormularioOpcao
interface FormularioOpcaoRequest {
  data: {
    servico?: number | string;
    servicos_secundarios?: (number | string)[];
    formulario?: number | string;
    locale?: string;
    localizations?: (number | string)[];
  };
}

// Tipos para Notifications
interface NotificationRequest {
  data: {
    is_read?: boolean;
    metadata?: any; // JSON
    title: string;
    locale?: string;
    localizations?: (number | string)[];
  };
}

// Tipos para autenticação e criação de usuários
interface LoginRequest {
  identifier: string;
  password: string;
}

interface CreateUserRequest {
  username: string;
  email: string;
  provider?: string;
  password: string;
  resetPasswordToken?: string;
  confirmationToken?: string;
  confirmed?: boolean;
  blocked?: boolean;
  role?: number | string; // Relacionamento com Role
  servicos?: (number | string)[]; // Relacionamento com Servico
  plano?: number | string; // Relacionamento com Plano
  cpf_cnpj?: string;
  telefone?: string;
  metadata?: any; // JSON
  name: string;
}

// Função auxiliar para obter o token
const getAuthHeaders = () => {
  const token = localStorage.getItem('token'); // Supondo que o token esteja armazenado no localStorage
  return { Authorization: `Bearer ${token}` };
};

// Funções para autenticação
export const login = (data: LoginRequest) => {
  return axios.post(`${API_BASE_URL}/auth/local?populate=*`, data);
};

export const forgotPassword = (email: string) => {
  return axios.post(`${API_BASE_URL}/auth/forgot-password`, { email }, { headers: getAuthHeaders() });
};

export const resetPassword = (data: {
  password: string;
  passwordConfirmation: string;
  code: string;
}) => {
  return axios.post(`${API_BASE_URL}/auth/reset-password`, data, { headers: getAuthHeaders() });
};

export const getMe = (params: Record<string, any>, token: string) => {
  return axios.get(`${API_BASE_URL}/users/me`, { params, headers: { Authorization: `Bearer ${token}` } });
};

export const getAuthMe = (params: Record<string, any>) => {
  return axios.get(`${API_BASE_URL}/users/me`, { params, headers: getAuthHeaders() });
};

export const getUsers = (params: Record<string, any>) => {
  return axios.get(`${API_BASE_URL}/users`, { params, headers: getAuthHeaders() });
};

export const getUserById = (id: number | string) => {
  return axios.get(`${API_BASE_URL}/users/${id}`, { headers: getAuthHeaders() });
};

export const createUser = (data: CreateUserRequest) => {
  const publishedData = { ...data, publishedAt: new Date().toISOString() }
  return axios.post(`${API_BASE_URL}/users`, publishedData, { headers: getAuthHeaders() });
};

export const updateUser = (id: number, data: Partial<CreateUserRequest>) => {
  return axios.put(`${API_BASE_URL}/users/${id}`, data, { headers: getAuthHeaders() });
};

export const deleteUser = (id: number) => {
  return axios.delete(`${API_BASE_URL}/users/${id}`, { headers: getAuthHeaders() });
};

// Funções para rotas de Checkins
export const getCheckins = (params: Record<string, any>) => {
  return axios.get(`${API_BASE_URL}/checkins`, { params, headers: getAuthHeaders() });
};

export const createCheckin = (data: CheckinRequest) => {
  const publishedData = { ...data, publishedAt: new Date().toISOString() }

  return axios.post(`${API_BASE_URL}/checkins`, publishedData, { headers: getAuthHeaders() });
};

export const getCheckinById = (id: number) => {
  return axios.get(`${API_BASE_URL}/checkins/${id}`, { headers: getAuthHeaders() });
};

export const updateCheckin = (id: number | string, data: UpdateCheckinRequest) => {
  return axios.put(`${API_BASE_URL}/checkins/${id}`, data, { headers: getAuthHeaders() });
};

export const deleteCheckin = (id: number) => {
  return axios.delete(`${API_BASE_URL}/checkins/${id}`, { headers: getAuthHeaders() });
};

// Funções para rotas de Formularios
export const getFormularios = (params: Record<string, any>) => {
  return axios.get(`${API_BASE_URL}/formularios`, { params, headers: getAuthHeaders() });
};

export const createFormulario = (data: FormularioRequest) => {
  const publishedData = { ...data, publishedAt: new Date().toISOString() }
  return axios.post(`${API_BASE_URL}/formularios`, publishedData, { headers: getAuthHeaders() });
};

export const getFormularioById = (id: number | string) => {
  return axios.get(`${API_BASE_URL}/formularios/${id}`, { headers: getAuthHeaders() });
};

export const updateFormulario = (id: number| string, data: FormularioRequest) => {
  return axios.put(`${API_BASE_URL}/formularios/${id}`, data, { headers: getAuthHeaders() });
};

export const deleteFormulario = (id: number) => {
  return axios.delete(`${API_BASE_URL}/formularios/${id}`, { headers: getAuthHeaders() });
};

// Funções para rotas de Planos
export const getPlanos = (params: Record<string, any>) => {
  return axios.get(`${API_BASE_URL}/planos`, { params, headers: getAuthHeaders() });
};

export const createPlano = (data: PlanoRequest) => {
  const publishedData = { ...data, publishedAt: new Date().toISOString() }

  return axios.post(`${API_BASE_URL}/planos`, publishedData, { headers: getAuthHeaders() });
};

export const getPlanoById = (id: number) => {
  return axios.get(`${API_BASE_URL}/planos/${id}`, { headers: getAuthHeaders() });
};

export const updatePlano = (id: number | string, data: PlanoRequest) => {
  return axios.put(`${API_BASE_URL}/planos/${id}`, data, { headers: getAuthHeaders() });
};

export const deletePlano = (id: number | string) => {
  return axios.delete(`${API_BASE_URL}/planos/${id}`, { headers: getAuthHeaders() });
};

// Funções para rotas de PlanoServicos
export const getPlanoServicos = (params: Record<string, any>) => {
  return axios.get(`${API_BASE_URL}/plano-servicos`, { params, headers: getAuthHeaders() });
};

export const createPlanoServico = (data: PlanoServicoRequest) => {
  const publishedData = { ...data, publishedAt: new Date().toISOString() }

  return axios.post(`${API_BASE_URL}/plano-servicos`, publishedData, { headers: getAuthHeaders() });
};

export const getPlanoServicoById = (id: number | string) => {
  return axios.get(`${API_BASE_URL}/plano-servicos/${id}`, { headers: getAuthHeaders() });
};

export const updatePlanoServico = (id: number | string, data: PlanoServicoRequest) => {
  return axios.put(`${API_BASE_URL}/plano-servicos/${id}`, data, { headers: getAuthHeaders() });
};

export const deletePlanoServico = (id: number | string) => {
  return axios.delete(`${API_BASE_URL}/plano-servicos/${id}`, { headers: getAuthHeaders() });
};

// Funções para rotas de Serviços
export const getServicos = (params: Record<string, any>) => {
  return axios.get(`${API_BASE_URL}/servicos`, { params, headers: getAuthHeaders() });
};

export const createServico = (data: ServicoRequest) => {
  const publishedData = { ...data, publishedAt: new Date().toISOString() }

  return axios.post(`${API_BASE_URL}/servicos`, publishedData, { headers: getAuthHeaders() });
};

export const getServicoById = (id: number) => {
  return axios.get(`${API_BASE_URL}/servicos/${id}`, { headers: getAuthHeaders() });
};

export const updateServico = (id: number | string, data: ServicoRequest) => {
  return axios.put(`${API_BASE_URL}/servicos/${id}`, data, { headers: getAuthHeaders() });
};

export const deleteServico = (id: number | string) => {
  return axios.delete(`${API_BASE_URL}/servicos/${id}`, { headers: getAuthHeaders() });
};

// Funções para rotas de FormularioOpcao
export const getFormularioOpcaos = (params: Record<string, any>) => {
  return axios.get(`${API_BASE_URL}/formulario-opcaos`, { params, headers: getAuthHeaders() });
};

export const createFormularioOpcao = (data: FormularioOpcaoRequest) => {
  const publishedData = { ...data, publishedAt: new Date().toISOString() }

  return axios.post(`${API_BASE_URL}/formulario-opcaos`, publishedData, { headers: getAuthHeaders() });
};

export const getFormularioOpcaoById = (id: number | string) => {
  return axios.get(`${API_BASE_URL}/formulario-opcaos/${id}`, { headers: getAuthHeaders() });
};

export const updateFormularioOpcao = (id: number | string, data: FormularioOpcaoRequest) => {
  return axios.put(`${API_BASE_URL}/formulario-opcaos/${id}`, data, { headers: getAuthHeaders() });
};

export const deleteFormularioOpcao = (id: number | string) => {
  return axios.delete(`${API_BASE_URL}/formulario-opcaos/${id}`, { headers: getAuthHeaders() });
};

// Funções para rotas de Notifications
export const getNotifications = (params: Record<string, any>) => {
  return axios.get(`${API_BASE_URL}/notifications`, { params, headers: getAuthHeaders() });
};

export const createNotification = (data: NotificationRequest) => {
  const publishedData = { ...data, publishedAt: new Date().toISOString() }

  return axios.post(`${API_BASE_URL}/notifications`, publishedData, { headers: getAuthHeaders() });
};

export const getNotificationById = (id: number | string) => {
  return axios.get(`${API_BASE_URL}/notifications/${id}`, { headers: getAuthHeaders() });
};

export const updateNotification = (id: number | string, data: NotificationRequest) => {
  return axios.put(`${API_BASE_URL}/notifications/${id}`, data, { headers: getAuthHeaders() });
};

export const deleteNotification = (id: number | string) => {
  return axios.delete(`${API_BASE_URL}/notifications/${id}`, { headers: getAuthHeaders() });
};

export const getPublicFormularioByIdentify = (id: number | string, params: Record<string, any>) => {
  return axios.get(`${API_BASE_URL}/formularios/${id}`, { params });
};