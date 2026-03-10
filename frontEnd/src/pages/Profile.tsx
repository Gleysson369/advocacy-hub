import { useState, useEffect } from "react";
import { 
  User, Shield, Briefcase, Lock, MapPin, 
  Camera, CheckCircle2, History, Scale, KeyRound, Mail 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useUserProfile } from "@/hooks/useUserProfile";

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { profileData, isLoading, error, updateProfile } = useUserProfile();

  const [profile, setProfile] = useState({
    full_name: "",
    oab: "",
    oab_uf: "",
    cpf: "",
    email: "",
    phone: "",
    user_type: "Administrador",
    status: "Ativa",
    created_at: "",
    last_access: "Hoje, às 09:15",
    username: "",
    specialty: "",
    office: "",
  });

  // Estados para o Modal de Senha
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });

  useEffect(() => {
    if (profileData) {
      // Prioriza dados vindos do Backend
      setProfile(prev => ({
        ...prev,
        full_name: profileData.full_name || "",
        oab: profileData.oab || "",
        oab_uf: profileData.oab_uf || "",
        cpf: profileData.cpf || "",
        email: profileData.email || user?.email || "",
        phone: profileData.phone || "",
        specialty: profileData.specialty || "",
        office: profileData.office || "",
        // Mantém dados derivados ou de fallback se não vierem do backend
        username: profileData.username || user?.email?.split('@')[0] || "",
        created_at: profileData.created_at ? new Date(profileData.created_at).toLocaleDateString('pt-BR') : prev.created_at,
        user_type: profileData.user_type || prev.user_type,
        status: profileData.status || prev.status,
      }));
    } else if (user) {
      // Fallback para metadados do Auth se o backend ainda não tiver dados (ex: primeiro login)
      const meta = (user as any).user_metadata || {};
      setProfile(prev => ({
        ...prev,
        full_name: meta.full_name || meta.name || "",
        email: user.email || "",
        username: user.email?.split('@')[0] || "",
        created_at: new Date(user.created_at).toLocaleDateString('pt-BR'),
        oab: meta.oab || "",
        oab_uf: meta.oab_uf || "",
        cpf: meta.cpf || "",
        phone: meta.phone || "",
        specialty: meta.specialty || "",
        office: meta.office || "",
      }));
    }
  }, [user, profileData]);

  // Validação e Salvamento Geral
  const handleSave = async () => {
    const cleanCPF = profile.cpf.replace(/\D/g, "");
    if (cleanCPF.length > 0 && cleanCPF.length !== 11) {
      toast({ variant: "destructive", title: "CPF Inválido", description: "O CPF deve conter 11 dígitos." });
      return;
    }

    try {
      await updateProfile.mutateAsync({
        full_name: profile.full_name,
        oab: profile.oab,
        oab_uf: profile.oab_uf,
        cpf: profile.cpf,
        phone: profile.phone,
        specialty: profile.specialty,
        office: profile.office,
      });

      toast({
        title: "Cadastro alterado com sucesso!",
        description: "As informações foram salvas na base de dados jurídica.",
        className: "bg-green-600 text-white border-none",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: error.message || "Não foi possível atualizar o perfil."
      });
    }
  };

  const handleUpdatePassword = () => {
    if (passwords.new !== passwords.confirm) {
      toast({ variant: "destructive", title: "Erro na senha", description: "A nova senha e a confirmação não coincidem." });
      return;
    }
    toast({ title: "Senha atualizada!", className: "bg-green-600 text-white" });
    setIsPassModalOpen(false);
    setPasswords({ current: "", new: "", confirm: "" });
  };

  const handleForgotPassword = () => {
    toast({
      title: "E-mail enviado",
      description: (
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-primary" />
          <span>Instruções enviadas para {profile.email}</span>
        </div>
      ),
    });
    setIsPassModalOpen(false);
  };

  // Exibir erro se houver
  useEffect(() => {
    if (error) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar perfil",
        description: "Não foi possível carregar os dados do perfil. Tente recarregar a página.",
      });
    }
  }, [error, toast]);

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500 pb-12 px-4">
      
      {/* HEADER DO PERFIL */}
      <div className="flex flex-col md:flex-row items-center gap-6 bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <div className="relative group">
          <div className="w-28 h-28 rounded-full bg-slate-100 border-4 border-white shadow-md flex items-center justify-center overflow-hidden">
            <User size={50} className="text-slate-300" />
          </div>
          <button className="absolute bottom-0 right-0 bg-[#1e293b] text-[#fbbf24] p-2 rounded-full border-2 border-white hover:bg-slate-800 transition-all">
            <Camera size={14} />
          </button>
        </div>
        
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-2xl font-bold text-slate-900">
            {isLoading ? "Carregando..." : (profile.full_name || user?.email || "Usuário")}
          </h1>
          <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-2">
            <Badge variant="outline" className="border-slate-300 font-mono">OAB/{profile.oab_uf || "--"} {profile.oab || "000000"}</Badge>
            <Badge className="bg-green-100 text-green-700 border-none"><CheckCircle2 className="w-3 h-3 mr-1" /> Conta {profile.status}</Badge>
          </div>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={isLoading || updateProfile.isPending}
          className="bg-[#1e293b] text-[#fbbf24] hover:bg-slate-800 px-10 disabled:opacity-50"
        >
          {updateProfile.isPending ? "Salvando..." : "Salvar Alterações"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* 1. IDENTIFICAÇÃO PROFISSIONAL */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-800"><User className="w-5 h-5 text-[#d99117]" /> Identificação Profissional</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Nome Completo</Label>
              <Input value={profile.full_name} onChange={e => setProfile({...profile, full_name: e.target.value})} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 space-y-1.5">
                <Label>Número OAB</Label>
                <Input value={profile.oab} onChange={e => setProfile({...profile, oab: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                <Label>UF</Label>
                <Input value={profile.oab_uf} onChange={e => setProfile({...profile, oab_uf: e.target.value.toUpperCase()})} maxLength={2} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>CPF (Interno)</Label>
              <Input value={profile.cpf} onChange={e => setProfile({...profile, cpf: e.target.value})} />
            </div>
            <div className="space-y-1.5">
              <Label>E-mail Profissional</Label>
              <Input value={profile.email} onChange={e => setProfile({...profile, email: e.target.value})} />
            </div>
          </CardContent>
        </Card>

        {/* 2. ÁREAS DE ATUAÇÃO */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-800"><Scale className="w-5 h-5 text-[#d99117]" /> Áreas de Atuação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Especialidades</Label>
              <Input value={profile.specialty} onChange={e => setProfile({...profile, specialty: e.target.value})} placeholder="Ex: Cível, Trabalhista..." />
            </div>
            <div className="space-y-1.5">
              <Label>Escritório Vinculado</Label>
              <Input value={profile.office} onChange={e => setProfile({...profile, office: e.target.value})} />
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-dashed border-slate-200">
              <p className="text-[10px] text-slate-500 uppercase font-bold text-center">Certificado Digital (A1/A3)</p>
              <Button variant="link" className="w-full text-xs text-primary h-auto p-1">Vincular Token Judiciário</Button>
            </div>
          </CardContent>
        </Card>

        {/* 3. SEGURANÇA DE ACESSO */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-800"><Lock className="w-5 h-5 text-[#d99117]" /> Segurança de Acesso</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Login (Username)</Label>
              <Input value={profile.username} onChange={e => setProfile({...profile, username: e.target.value})} className="font-mono bg-slate-50" />
            </div>

            <Dialog open={isPassModalOpen} onOpenChange={setIsPassModalOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full text-sm border-slate-200 hover:bg-slate-50 gap-2 font-bold">
                  <KeyRound size={16} /> Alterar Senha do Sistema
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Alterar Senha</DialogTitle>
                  <DialogDescription>Preencha os dados abaixo para atualizar sua credencial.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Senha Atual</Label>
                    <Input type="password" value={passwords.current} onChange={e => setPasswords({...passwords, current: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Nova Senha</Label>
                    <Input type="password" value={passwords.new} onChange={e => setPasswords({...passwords, new: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Confirmar Nova Senha</Label>
                    <Input type="password" value={passwords.confirm} onChange={e => setPasswords({...passwords, confirm: e.target.value})} />
                  </div>
                  <button onClick={handleForgotPassword} className="text-xs text-[#d99117] hover:underline font-bold">Esqueci minha senha</button>
                </div>
                <DialogFooter>
                  <Button variant="ghost" onClick={() => setIsPassModalOpen(false)}>Cancelar</Button>
                  <Button onClick={handleUpdatePassword} className="bg-[#1e293b] text-[#fbbf24]">Atualizar Senha</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-100">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-bold text-slate-700">Autenticação 2FA</span>
              </div>
              <Badge className="bg-amber-200 text-amber-800 border-none">Inativo</Badge>
            </div>
          </CardContent>
        </Card>

        {/* 4. CONTROLE DO SISTEMA */}
        <Card className="border-none shadow-sm bg-slate-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-800"><Briefcase className="w-5 h-5 text-[#d99117]" /> Controle do Sistema</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm py-1.5 border-b border-slate-200">
              <span className="text-slate-500">Tipo de Usuário:</span>
              <Badge className="bg-[#1e293b] text-[#fbbf24] border-none text-[10px]">{profile.user_type}</Badge>
            </div>
            <div className="flex justify-between text-sm py-1.5 border-b border-slate-200">
              <span className="text-slate-500">Data de Cadastro:</span>
              <span className="font-medium text-slate-700">{profile.created_at}</span>
            </div>
            <div className="flex justify-between text-sm py-1.5 border-b border-slate-200">
              <span className="text-slate-500">Último Acesso:</span>
              <span className="font-medium text-slate-700">{profile.last_access}</span>
            </div>
            <Button variant="ghost" className="w-full mt-2 text-[11px] text-slate-400 gap-2 hover:bg-transparent">
              <History size={12} /> Ver Histórico de Atividades (Logs)
            </Button>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}