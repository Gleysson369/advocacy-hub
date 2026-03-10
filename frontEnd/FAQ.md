# 🤔 FAQ e Troubleshooting

## ❓ Perguntas Frequentes

### P: Como autenticar minhas requisições?

**R:** O cliente HTTP (`api-client.ts`) adiciona automaticamente o token JWT no header:
```typescript
Authorization: Bearer token_aqui
```

Você não precisa fazer nada, apenas usar:
```typescript
const data = await apiClient.get('/users');
```

---

### P: Como fazer login programaticamente?

**R:** Use o hook `useAuth`:
```typescript
import { useAuth } from '@/hooks/useAuth';

function MyComponent() {
  const { signIn, user, token } = useAuth();

  const handleLogin = async () => {
    const { error } = await signIn('email@example.com', 'password123');
    if (!error) {
      console.log('Logado!', user, token);
    }
  };

  return <button onClick={handleLogin}>Login</button>;
}
```

---

### P: Como verificar se o usuário está logado?

**R:** Use o hook `useAuth` e a propriedade `isAuthenticated`:
```typescript
const { isAuthenticated, user } = useAuth();

if (isAuthenticated) {
  console.log('Usuário:', user?.email);
}
```

---

### P: Como fazer requisições para outros endpoints?

**R:** Use o `apiClient`:
```typescript
// GET
const clients = await apiClient.get('/users');

// POST
const newClient = await apiClient.post('/users', {
  name: 'João Silva',
  email: 'joao@example.com'
});

// PUT
const updated = await apiClient.put('/users/123', {
  name: 'João Silva Atualizado'
});

// DELETE
await apiClient.delete('/users/123');
```

---

### P: Como criar um novo hook de dados?

**R:** Siga o padrão:
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';

export function useMinhaFeature() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // GET - Buscar dados
  const { data, isLoading, error } = useQuery({
    queryKey: ['minha-feature'],
    queryFn: () => apiClient.get('/meu-endpoint'),
  });

  // POST - Criar
  const create = useMutation({
    mutationFn: (data) => apiClient.post('/meu-endpoint', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['minha-feature'] });
      toast({ title: 'Criado com sucesso!' });
    },
    onError: (error) => {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    }
  });

  // PUT - Atualizar
  const update = useMutation({
    mutationFn: ({ id, ...data }) => apiClient.put(`/meu-endpoint/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['minha-feature'] });
      toast({ title: 'Atualizado com sucesso!' });
    }
  });

  // DELETE - Deletar
  const delete_ = useMutation({
    mutationFn: (id) => apiClient.delete(`/meu-endpoint/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['minha-feature'] });
      toast({ title: 'Deletado com sucesso!' });
    }
  });

  return { data, isLoading, error, create, update, delete: delete_ };
}
```

---

### P: Por que meu token foi perdido ao recarregar a página?

**R:** O token deve estar armazenado no localStorage. Verifique em DevTools:
```javascript
// Console do navegador
localStorage.getItem('auth_token')
localStorage.getItem('auth_user')
```

Se estiver vazio, é preciso fazer login novamente.

---

### P: Como proteger uma rota?

**R:** Use o componente `ProtectedRoute`:
```typescript
import { ProtectedRoute } from '@/components/ProtectedRoute';
import MinhaPagina from '@/pages/MinhaPagina';

export const routes = [
  {
    path: '/pagina-protegida',
    element: (
      <ProtectedRoute>
        <MinhaPagina />
      </ProtectedRoute>
    )
  }
];
```

---

## 🐛 Troubleshooting

### ❌ "Backend não está respondendo"

**Solução:**
```bash
# 1. Verificar se está rodando
ps aux | grep "node\|tsx"

# 2. Se não estiver, iniciar
cd backEnd
npm run dev

# 3. Verificar porta
curl http://localhost:3333/api-docs
```

---

### ❌ "CORS Error no console"

**Causas possíveis:**
1. Backend não está rodando
2. Frontend rodando em porta diferente (esperado 5173)
3. CORS não foi instalado/recarregado

**Solução:**
```bash
# Instalar cors se não tiver
cd backEnd
npm install cors @types/cors

# Reiniciar backend
npm run dev
```

---

### ❌ "Login não funciona"

**Verificar:**
```bash
# 1. POST /api/login está sendo chamado?
curl -X POST http://localhost:3333/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass123"}'

# 2. Banco de dados está rodando?
npx prisma studio

# 3. JWT_SECRET está configurado?
cat backEnd/.env | grep JWT_SECRET
```

---

### ❌ "Token inválido / 401 Unauthorized"

**Possíveis causas:**
1. Token expirou (padrão 1 dia)
2. JWT_SECRET mudou
3. Token foi corrompido

**Solução:**
```typescript
// Fazer logout e login novamente
const { signOut, signIn } = useAuth();
await signOut();
await signIn(email, password);
```

---

### ❌ "Dados não carregam"

**Verificar:**
```typescript
// 1. Confirmar endpoint correto
const data = await apiClient.get('/users');
console.log(data);

// 2. Confirmar se está autenticado
const { token } = useAuth();
console.log('Token:', token);

// 3. Verificar erro na API
const response = await apiClient.get('/users')
  .catch(e => console.error('Erro:', e.message));
```

---

### ❌ "Erro 404 em um endpoint"

**Possíveis causas:**
1. Endpoint não existe no backend
2. URL está errada
3. Método HTTP errado (GET vs POST)

**Verificar:**
```bash
# Ver todos os endpoints
curl http://localhost:3333/api-docs

# Ou no backend, ver estrutura de rotas
# Procurar em src/*/routes/
```

---

### ❌ "Senha de hash erro"

**Verificar:**
```bash
# Se bcrypt está instalado
cd backEnd
npm list bcrypt

# Se não estiver
npm install bcrypt @types/bcrypt
```

---

## 🔧 Dicas de Debug

### 1. Ativar logs no frontend

```typescript
// Em src/lib/api-client.ts, adicionar:
async function apiRequest<T>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  console.log('📤 Requisição:', { method: options.method, url });
  
  const response = await fetch(url, { ... });
  
  console.log('📥 Resposta:', { status: response.status, url });
  
  return response.json();
}
```

### 2. Ativar logs no backend

```typescript
// Em src/server.ts:
server.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});
```

### 3. Usar DevTools

```javascript
// Console do navegador
localStorage // Ver tudo armazenado
localStorage.getItem('auth_token') // Ver token
sessionStorage // Ver variáveis de sessão
```

### 4. Usar Network Tab

- Abrir DevTools (F12)
- Ir para "Network"
- Fazer login
- Ver requisição para `/api/login`
- Verificar Response Headers (deve ter token)

---

## 📝 Checklist de Debug

Quando algo não funcionar:

- [ ] Backend está rodando? (`curl http://localhost:3333/api-docs`)
- [ ] Frontend está rodando? (http://localhost:5173)
- [ ] Banco de dados está rodando? (`npx prisma studio`)
- [ ] JWT_SECRET configurado? (`grep JWT_SECRET backEnd/.env`)
- [ ] CORS instalado? (`npm list cors`)
- [ ] Arquivo `.env` existe? (frontEnd e backEnd)
- [ ] Token no localStorage? (`localStorage.getItem('auth_token')`)
- [ ] Erro no console? (F12 > Console)
- [ ] Erro no Network? (F12 > Network > ver resposta)
- [ ] Logs no backend? (Terminal do npm run dev)

---

## 💬 Exemplos Completos

### Exemplo 1: Criar Cliente com Validação

```typescript
function CreateClientForm() {
  const { createClient } = useClients();
  const [formData, setFormData] = useState({ name: '', email: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação
    if (!formData.name) {
      alert('Nome é obrigatório');
      return;
    }

    try {
      await createClient.mutateAsync(formData);
      setFormData({ name: '', email: '' });
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        placeholder="Nome"
      />
      <input
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        placeholder="Email"
      />
      <button type="submit">Criar</button>
    </form>
  );
}
```

### Exemplo 2: Listar Clientes com Loading

```typescript
function ClientsList() {
  const { clients, isLoading, error } = useClients();

  if (isLoading) return <p>Carregando...</p>;
  if (error) return <p>Erro ao carregar</p>;
  if (!clients.length) return <p>Nenhum cliente</p>;

  return (
    <ul>
      {clients.map((client) => (
        <li key={client.id}>{client.name} - {client.email}</li>
      ))}
    </ul>
  );
}
```

### Exemplo 3: Logout

```typescript
function LogoutButton() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return <button onClick={handleLogout}>Logout</button>;
}
```

---

## 📞 Suporte

Se o problema persistir:

1. Verifique a documentação em `SETUP_GUIDE.md`
2. Execute `python3 check-integration.py` para diagnóstico
3. Verifique os logs no terminal do backend
4. Use o Swagger em `http://localhost:3333/api-docs` para testar endpoints

---

**Última atualização**: 07/02/2026  
**Versão**: 1.0.0  
**Status**: ✅ Completo
