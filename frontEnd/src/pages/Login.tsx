import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [isRecovering, setIsRecovering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [oabNumber, setOabNumber] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn, signUp, resetPassword } = useAuth() as any;

  useEffect(() => {
    const expiredReason = localStorage.getItem("session_expired_reason");
    if (expiredReason === "idle") {
      localStorage.removeItem("session_expired_reason");
      toast({
        title: "Sessão encerrada",
        description: "Você ficou inativo por muito tempo. Faça login novamente.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const validateStrongPassword = (value: string): string | null => {
    if (value.length < 8) return "A senha deve ter no mínimo 8 caracteres.";
    if (!/[A-Z]/.test(value)) return "A senha deve ter pelo menos 1 letra maiúscula.";
    if (!/[a-z]/.test(value)) return "A senha deve ter pelo menos 1 letra minúscula.";
    if (!/[0-9]/.test(value)) return "A senha deve ter pelo menos 1 número.";
    if (!/[^A-Za-z0-9]/.test(value)) return "A senha deve ter pelo menos 1 caractere especial (ex.: +, !, @).";
    return null;
  };

  // Função para limpar campos
  const clearForm = () => {
    setEmail("");
    setPassword("");
    setName("");
    setOabNumber("");
    setSpecialty("");
    setNewPassword("");
    setConfirmNewPassword("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isRecovering) {
        if (resetPassword) {
          const passwordError = validateStrongPassword(newPassword);
          if (passwordError) {
            throw new Error(passwordError);
          }
          if (newPassword !== confirmNewPassword) {
            throw new Error("A confirmação da nova senha não confere.");
          }

          const { error } = await resetPassword({
            email,
            oabNumber,
            newPassword,
          });
          if (error) throw error;
        } else {
          throw new Error("Fluxo de recuperação indisponível.");
        }
        toast({ title: "Senha redefinida!", description: "Faça login com sua nova senha." });
        setIsRecovering(false);
        clearForm();
      } else if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) throw error;
        toast({ title: "Bem-vindo de volta!", description: "Login realizado com sucesso." });
        clearForm();
        navigate("/");
      } else {
        const passwordError = validateStrongPassword(password);
        if (passwordError) {
          throw new Error(passwordError);
        }

        const { error } = await signUp({
          email,
          password,
          name,
          oabNumber,
          specialty,
        });
        if (error) throw error;
        toast({ title: "Conta criada!", description: "Você já pode acessar o sistema." });
        clearForm();
        navigate("/");
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-navy items-center justify-center p-12">
        <div className="text-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-gold flex items-center justify-center mx-auto mb-8">
            <Scale className="w-12 h-12 text-primary" />
          </div>
          <h1 className="font-serif text-4xl font-bold text-white mb-4">LexOffice</h1>
          <p className="text-white/70 text-lg max-w-md">
            Sistema completo de gestão para escritórios de advocacia. 
            Organize seus processos, clientes e compromissos em um só lugar.
          </p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8 text-center">
            <div className="w-16 h-16 rounded-xl bg-gradient-gold flex items-center justify-center mx-auto mb-4">
              <Scale className="w-10 h-10 text-primary" />
            </div>
            <h1 className="font-serif text-2xl font-bold text-foreground">LexOffice</h1>
          </div>

          <div className="bg-card p-8 rounded-xl shadow-card">
            <h2 className="font-serif text-2xl font-semibold mb-2">
              {isRecovering ? "Recuperar Senha" : isLogin ? "Entrar" : "Criar conta"}
            </h2>
            <p className="text-muted-foreground mb-6">
              {isRecovering
                ? "Informe e-mail, OAB e a nova senha para redefinir seu acesso"
                : isLogin
                  ? "Acesse sua conta para continuar"
                  : "Preencha os dados para criar sua conta"}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && !isRecovering && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome completo</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Dr. João Silva"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required={!isLogin}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="oabNumber">Nº da OAB</Label>
                    <Input
                      id="oabNumber"
                      type="text"
                      placeholder="123456"
                      value={oabNumber}
                      onChange={(e) => setOabNumber(e.target.value)}
                      required={!isLogin}
                    />
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="specialty">Especialidade</Label>
                    <Input
                      id="specialty"
                      type="text"
                      placeholder="Direito Civil"
                      value={specialty}
                      onChange={(e) => setSpecialty(e.target.value)}
                      required={!isLogin}
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {isRecovering && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="recover-oab">Nº da OAB</Label>
                    <Input
                      id="recover-oab"
                      type="text"
                      placeholder="123456"
                      value={oabNumber}
                      onChange={(e) => setOabNumber(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">Nova senha</Label>
                    <Input
                      id="new-password"
                      type="password"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={8}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-new-password">Confirmar nova senha</Label>
                    <Input
                      id="confirm-new-password"
                      type="password"
                      placeholder="••••••••"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      required
                      minLength={8}
                    />
                    <p className="text-xs text-muted-foreground">
                      Use 8+ caracteres com maiúscula, minúscula, número e símbolo (ex.: <code>Lgbtqia+2026</code>).
                    </p>
                  </div>
                </>
              )}

              {!isRecovering && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Senha</Label>
                    {isLogin && (
                      <button
                        type="button"
                        onClick={() => setIsRecovering(true)}
                        className="text-xs text-accent hover:underline"
                      >
                        Esqueceu a senha?
                      </button>
                    )}
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                  {!isLogin && (
                    <p className="text-xs text-muted-foreground">
                      Use 8+ caracteres com maiúscula, minúscula, número e símbolo (ex.: <code>Lgbtqia+2026</code>).
                    </p>
                  )}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Carregando..." : isRecovering ? "Redefinir senha" : isLogin ? "Entrar" : "Criar conta"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              {isRecovering ? (
                <button
                  type="button"
                  onClick={() => setIsRecovering(false)}
                  className="text-sm text-accent hover:underline"
                >
                  Voltar para o login
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-sm text-accent hover:underline"
                >
                  {isLogin ? "Não tem conta? Crie uma agora" : "Já tem conta? Faça login"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
