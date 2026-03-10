import { useState } from "react";
import { 
  Bell, Scale, ShieldCheck, 
  Save, Smartphone, Mail,
  Clock, History, ShieldAlert
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSaveSettings = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Configurações atualizadas!",
        description: "Suas preferências foram aplicadas com sucesso.",
        className: "bg-green-600 text-white border-none",
      });
    }, 800);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12 px-4">
      
      {/* HEADER */}
      <div className="flex justify-between items-end border-b pb-6 border-slate-100">
        <div>
          <h1 className="text-3xl font-serif font-bold text-slate-900">Configurações</h1>
          <p className="text-slate-500 text-sm">Gerencie alertas, parâmetros jurídicos e segurança da conta.</p>
        </div>
        <Button onClick={handleSaveSettings} disabled={loading} className="bg-[#1e293b] text-[#fbbf24] hover:bg-slate-800 gap-2 shadow-lg">
          <Save className="w-4 h-4" />
          {loading ? "Salvando..." : "Salvar Alterações"}
        </Button>
      </div>

      <Tabs defaultValue="notifications" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-slate-100 p-1 rounded-xl max-w-2xl">
          <TabsTrigger value="notifications" className="gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Bell className="w-4 h-4" /> Notificações
          </TabsTrigger>
          <TabsTrigger value="juridical" className="gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Scale className="w-4 h-4" /> Jurídico
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <ShieldCheck className="w-4 h-4" /> Segurança
          </TabsTrigger>
        </TabsList>

        {/* --- ABA NOTIFICAÇÕES --- */}
        <TabsContent value="notifications" className="space-y-4 mt-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Bell className="w-5 h-5 text-[#d99117]" /> Canais de Comunicação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-xl hover:bg-slate-50 transition-colors">
                <div className="space-y-0.5">
                  <Label className="text-base font-bold">Relatórios por E-mail</Label>
                  <p className="text-sm text-slate-500">Resumo matinal de audiências e petições pendentes.</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-xl hover:bg-slate-50 transition-colors">
                <div className="space-y-0.5">
                  <Label className="text-base font-bold">Alertas Push</Label>
                  <p className="text-sm text-slate-500">Notificações em tempo real no navegador para movimentações do tribunal.</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="space-y-3 pt-2">
                <Label className="text-slate-700">Antecedência de Aviso para Prazos Judiciais</Label>
                <Select defaultValue="48h">
                  <SelectTrigger className="w-full md:w-[320px] bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24h">24 horas antes do vencimento</SelectItem>
                    <SelectItem value="48h">48 horas antes do vencimento</SelectItem>
                    <SelectItem value="72h">72 horas antes do vencimento</SelectItem>
                    <SelectItem value="5d">5 dias antes do vencimento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- ABA JURÍDICO --- */}
        <TabsContent value="juridical" className="space-y-4 mt-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Scale className="w-5 h-5 text-[#d99117]" /> Parâmetros do Escritório
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Honorários Padrão (%)</Label>
                  <Input type="number" placeholder="20" className="bg-white" />
                  <p className="text-[10px] text-slate-400 font-medium italic">Valor aplicado automaticamente em novos contratos.</p>
                </div>
                <div className="space-y-2">
                  <Label>Valor Hora Técnica (R$)</Label>
                  <Input type="number" placeholder="350,00" className="bg-white" />
                </div>
                <div className="space-y-2">
                  <Label>Tribunal Principal para Recorte</Label>
                  <Select defaultValue="tjsp">
                    <SelectTrigger className="bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tjsp">TJSP - São Paulo</SelectItem>
                      <SelectItem value="tjrj">TJRJ - Rio de Janeiro</SelectItem>
                      <SelectItem value="trf3">TRF3 - Justiça Federal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Moeda Padrão do Sistema</Label>
                  <Select defaultValue="brl">
                    <SelectTrigger className="bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="brl">Real (BRL)</SelectItem>
                      <SelectItem value="usd">Dólar (USD)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- ABA SEGURANÇA --- */}
        <TabsContent value="security" className="space-y-4 mt-6">
          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#d99117]" /> Privacidade e Auditoria
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="flex items-center justify-between p-4 bg-amber-50/50 border border-amber-100 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-amber-100 rounded-full">
                    <ShieldAlert className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <Label className="text-base font-bold text-amber-900">Sessão Automática</Label>
                    <p className="text-sm text-amber-700/80">Deslogar o usuário após tempo de inatividade.</p>
                  </div>
                </div>
                <Select defaultValue="30m">
                  <SelectTrigger className="w-32 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15m">15 min</SelectItem>
                    <SelectItem value="30m">30 min</SelectItem>
                    <SelectItem value="1h">1 hora</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <Label className="text-slate-700 font-bold px-1">Dispositivos Conectados</Label>
                <div className="border rounded-xl divide-y">
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Smartphone className="w-5 h-5 text-slate-400" />
                      <div>
                        <p className="text-sm font-bold text-slate-700">Windows PC • Chrome</p>
                        <p className="text-[10px] text-green-600 font-black flex items-center gap-1 uppercase tracking-tight">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> Sessão Atual
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px]">Goiânia, BR</Badge>
                  </div>
                </div>
                <Button variant="ghost" className="w-full text-red-500 hover:text-red-600 hover:bg-red-50 font-bold gap-2">
                   Encerrar Todas as Outras Sessões
                </Button>
              </div>

              <div className="pt-4 border-t">
                 <Button variant="outline" className="w-full gap-2 border-slate-200">
                   <History className="w-4 h-4 text-slate-500" /> Exportar Log de Atividades (CSV)
                 </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Badge({ children, variant, className }: { children: React.ReactNode, variant?: string, className?: string }) {
  return <span className={`px-2 py-0.5 rounded-full border ${className}`}>{children}</span>;
}