// Detectar o host do backend baseado no host atual do frontend
export function getApiBaseUrl(): string {
  // Se VITE_API_URL estiver definido, usar ele
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Caso contrário, detectar automaticamente baseado no host atual
  const currentHost = window.location.hostname;
  
  // Se estiver em localhost, usar localhost para o backend também
  if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
    return 'http://localhost:3333/api';
  }
  
  // Se estiver em um IP (ex: 172.24.0.1), usar o mesmo IP para o backend
  return `http://${currentHost}:3333/api`;
}

export const API_BASE_URL = getApiBaseUrl();
export const BACKEND_BASE_URL = API_BASE_URL.replace(/\/api$/, "");

interface ApiRequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean>;
}

async function apiRequest<T>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const { params, ...fetchOptions } = options;

  let url = `${API_BASE_URL}${endpoint}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, String(value));
    });
    url += `?${searchParams.toString()}`;
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  };

  // Adicionar token JWT se disponível
  const token = localStorage.getItem('auth_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    });

    // Tratar resposta vazia (204 No Content)
    if (response.status === 204) {
      return null as T;
    }

    // Verificar se a resposta é OK
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      
      // Tentar extrair mensagem de erro do JSON
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        // Se não for JSON, tentar ler como texto
        try {
          const errorText = await response.text();
          if (errorText) {
            errorMessage = errorText;
          }
        } catch {
          // Se falhar, usar mensagem padrão
        }
      }
      
      throw new Error(errorMessage);
    }

    // Verificar se há conteúdo para parsear
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }

    // Se não for JSON, retornar texto ou null
    const text = await response.text();
    return (text ? JSON.parse(text) : null) as T;
  } catch (error) {
    // Tratar erros de rede (fetch falhou antes de chegar ao servidor)
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(
        `Erro de conexão: Não foi possível conectar ao servidor. Verifique se o backend está rodando em ${API_BASE_URL}`
      );
    }
    
    // Re-lançar outros erros
    throw error;
  }
}

export const apiClient = {
  get: <T,>(endpoint: string, options?: ApiRequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: 'GET' }),

  post: <T,>(endpoint: string, body?: unknown, options?: ApiRequestOptions) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T,>(endpoint: string, body?: unknown, options?: ApiRequestOptions) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T,>(endpoint: string, options?: ApiRequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: 'DELETE' }),

  patch: <T,>(endpoint: string, body?: unknown, options?: ApiRequestOptions) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    }),
};
