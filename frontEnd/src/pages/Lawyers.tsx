import { useState } from "react";
import { Plus, Search, Pencil, Trash2, User, Phone, Mail, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useLawyers, LawyerInput, Lawyer } from "@/hooks/useLawyers";

const initialFormData: LawyerInput = {
  name: "",
  email: "",
  oabNumber: "",
  specialty: "",
  phone: null,
};

export default function Lawyers() {
  const { lawyers, isLoading, createLawyer, updateLawyer, deleteLawyer } = useLawyers();
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLawyerId, setEditingLawyerId] = useState<string | null>(null);
  const [formData, setFormData] = useState<LawyerInput>(initialFormData);

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const filteredLawyers = lawyers?.filter(
    (lawyer) =>
      lawyer.name?.toLowerCase().includes(search.toLowerCase()) ||
      lawyer.email?.toLowerCase().includes(search.toLowerCase()) ||
      lawyer.oabNumber?.toLowerCase().includes(search.toLowerCase()) ||
      lawyer.specialty?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const handleOpenDialog = (lawyer?: Lawyer) => {
    if (lawyer) {
      setEditingLawyerId(lawyer.id);
      setFormData({
        name: lawyer.name,
        email: lawyer.email,
        oabNumber: lawyer.oabNumber,
        specialty: lawyer.specialty,
        phone: lawyer.phone,
      });
    } else {
      setEditingLawyerId(null);
      setFormData(initialFormData);
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingLawyerId) {
        await updateLawyer.mutateAsync({ id: editingLawyerId, ...formData });
      } else {
        await createLawyer.mutateAsync(formData);
      }
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Erro ao salvar advogado:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este advogado?")) {
      await deleteLawyer.mutateAsync(id);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-slate-900">Advogados</h1>
          <p className="text-muted-foreground">Gerencie os advogados do seu escritório</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="shadow-sm bg-[#1e293b] text-[#fbbf24] hover:bg-slate-800">
          <Plus className="w-4 h-4 mr-2" />
          Novo Advogado
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome, email, OAB ou especialidade..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-white shadow-sm focus-visible:ring-slate-400"
        />
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-muted-foreground italic">Carregando lista de advogados...</div>
        ) : filteredLawyers.length === 0 ? (
          <div className="p-16 text-center">
            <User className="w-12 h-12 mx-auto text-slate-200 mb-4" />
            <h3 className="text-lg font-semibold text-slate-800 mb-1">Nenhum advogado por aqui</h3>
            <p className="text-muted-foreground text-sm mb-6">
              {search ? "Nenhum resultado para sua busca." : "Adicione seu primeiro advogado para começar."}
            </p>
            {!search && (
              <Button onClick={() => handleOpenDialog()} variant="outline">
                Adicionar Agora
              </Button>
            )}
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="font-bold text-slate-700">Nome</TableHead>
                <TableHead className="font-bold text-slate-700">Contato</TableHead>
                <TableHead className="font-bold text-slate-700">OAB</TableHead>
                <TableHead className="font-bold text-slate-700">Especialidade</TableHead>
                <TableHead className="font-bold text-slate-700">Cadastro</TableHead>
                <TableHead className="w-[100px] text-right font-bold text-slate-700 px-6">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLawyers.map((lawyer) => (
                <TableRow key={lawyer.id} className="hover:bg-slate-50/50 transition-colors">
                  <TableCell className="font-semibold text-slate-900">{lawyer.name}</TableCell>
                  <TableCell className="text-sm">
                    <div className="flex flex-col">
                      <span className="flex items-center gap-1 text-slate-600">
                        <Mail className="w-3 h-3" /> {lawyer.email || "N/A"}
                      </span>
                      <span className="flex items-center gap-1 text-slate-400 text-xs">
                        <Phone className="w-3 h-3" /> {lawyer.phone || "-"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-slate-600">{lawyer.oabNumber}</TableCell>
                  <TableCell className="text-slate-600 text-sm">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      <GraduationCap className="w-3 h-3 mr-1" /> {lawyer.specialty}
                    </span>
                  </TableCell>
                  <TableCell className="text-slate-600 text-sm">{formatDate(lawyer.createdAt)}</TableCell>
                  <TableCell className="px-6">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(lawyer)} className="h-8 w-8 text-slate-400 hover:text-primary">
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(lawyer.id)} className="h-8 w-8 text-slate-400 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl bg-white shadow-2xl border-none">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">{editingLawyerId ? "Editar Advogado" : "Novo Advogado"}</DialogTitle>
            <DialogDescription>
              Preencha os dados para cadastrar um novo advogado ou editar um existente.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="name" className="font-bold text-slate-700">Nome Completo *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-slate-50 border-slate-200 focus:bg-white transition-all"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="font-bold text-slate-700">E-mail *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="bg-slate-50 border-slate-200 focus:bg-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="oabNumber" className="font-bold text-slate-700">Número da OAB *</Label>
                <Input
                  id="oabNumber"
                  value={formData.oabNumber}
                  onChange={(e) => setFormData({ ...formData, oabNumber: e.target.value })}
                  className="bg-slate-50 border-slate-200 focus:bg-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialty" className="font-bold text-slate-700">Especialidade *</Label>
                <Input
                  id="specialty"
                  value={formData.specialty}
                  onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                  className="bg-slate-50 border-slate-200 focus:bg-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="font-bold text-slate-700">Telefone</Label>
                <Input
                  id="phone"
                  value={formData.phone || ""}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value || null })}
                  className="bg-slate-50 border-slate-200 focus:bg-white"
                />
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button 
                type="submit" 
                className="px-8 shadow-md bg-[#1e293b] text-[#fbbf24] hover:bg-slate-800"
                disabled={createLawyer.isPending || updateLawyer.isPending}
              >
                {editingLawyerId ? "Salvar Alterações" : "Cadastrar Advogado"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
