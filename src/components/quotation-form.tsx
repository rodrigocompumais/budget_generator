"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Save, Loader2, Package, ListChecks } from 'lucide-react';
import { createQuotationAction } from '@/app/actions/quotation-actions';
import { useToast } from '@/hooks/use-toast';

interface QuotationItemInput {
    title: string;
    description: string;
    quantity: number;
    unit: string;
}

export function QuotationForm() {
    const router = useRouter();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [items, setItems] = useState<QuotationItemInput[]>([
        { title: '', description: '', quantity: 1, unit: 'un' }
    ]);

    const addItem = () => {
        setItems([...items, { title: '', description: '', quantity: 1, unit: 'un' }]);
    };

    const removeItem = (index: number) => {
        if (items.length > 1) {
            setItems(items.filter((_, i) => i !== index));
        }
    };

    const handleItemChange = (index: number, field: keyof QuotationItemInput, value: any) => {
        const newItems = [...items];
        (newItems[index] as any)[field] = value;
        setItems(newItems);
    };

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (!title) {
            toast({ variant: 'destructive', title: 'Erro', description: 'O título da cotação é obrigatório.' });
            return;
        }

        if (items.some(i => !i.title)) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Todos os produtos devem ter um nome.' });
            return;
        }

        setIsLoading(true);
        try {
            const result = await createQuotationAction({
                title,
                description,
                items: items as any
            });

            if (result.success) {
                toast({ title: 'Cotação enviada!', description: 'Link para fornecedores gerado com sucesso.' });
                router.push('/dashboard/quotations');
            } else {
                toast({ variant: 'destructive', title: 'Erro', description: result.error || 'Erro ao salvar.' });
            }
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Erro', description: 'Erro inesperado.' });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8 pb-12">
            <Card className="border-none shadow-sm overflow-hidden rounded-2xl">
                <CardHeader className="bg-primary/5 py-4 border-b">
                    <CardTitle className="text-lg flex items-center gap-2 text-primary">
                        <Package className="h-5 w-5" /> Informações Básicas
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                    <div className="space-y-2">
                        <Label htmlFor="title" className="text-xs font-black uppercase tracking-widest text-slate-400">Título da Cotação (Ex: Reforma Escritório 2024)</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="Identifique esta cotação"
                            className="h-12 text-lg font-bold border-slate-200"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="desc" className="text-xs font-black uppercase tracking-widest text-slate-400">Observações para os Fornecedores</Label>
                        <Textarea
                            id="desc"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Informações sobre entrega, prazos ou condições..."
                            rows={3}
                            className="border-slate-200"
                        />
                    </div>
                </CardContent>
            </Card>

            <Card className="border-none shadow-sm overflow-hidden rounded-2xl">
                <CardHeader className="bg-primary/5 py-4 border-b flex flex-row items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2 text-primary font-bold">
                        <ListChecks className="h-5 w-5" /> Lista de Produtos
                    </CardTitle>
                    <Button type="button" onClick={addItem} size="sm" className="rounded-full shadow-lg shadow-primary/20">
                        <Plus className="h-4 w-4 mr-2" /> Adicionar Produto
                    </Button>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="space-y-6">
                        {items.map((item, index) => (
                            <div key={index} className="group relative bg-slate-50 p-6 rounded-2xl border border-transparent hover:border-slate-200 transition-all">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute -top-3 -right-3 h-8 w-8 rounded-full bg-white shadow-md text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => removeItem(index)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>

                                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                    <div className="md:col-span-6 space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nome do Produto/Serviço</Label>
                                        <Input
                                            value={item.title}
                                            onChange={e => handleItemChange(index, 'title', e.target.value)}
                                            placeholder="Ex: Monitor Dell 27p"
                                            className="h-10 font-bold border-slate-200"
                                        />
                                    </div>
                                    <div className="md:col-span-3 space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Quantidade</Label>
                                        <Input
                                            type="number"
                                            value={item.quantity}
                                            onChange={e => handleItemChange(index, 'quantity', parseFloat(e.target.value))}
                                            className="h-10 font-bold border-slate-200"
                                        />
                                    </div>
                                    <div className="md:col-span-3 space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Unidade (un, kg, m)</Label>
                                        <Input
                                            value={item.unit}
                                            onChange={e => handleItemChange(index, 'unit', e.target.value)}
                                            className="h-10 font-bold border-slate-200"
                                        />
                                    </div>
                                    <div className="md:col-span-12 space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Detalhes Técnicos (Opcional)</Label>
                                        <Input
                                            value={item.description}
                                            onChange={e => handleItemChange(index, 'description', e.target.value)}
                                            placeholder="Ex: Modelo P2723D com entrada DP"
                                            className="h-10 text-xs border-slate-200"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-10 pt-8 border-t flex items-center justify-between">
                        <Button type="button" variant="ghost" onClick={() => router.back()} disabled={isLoading}>
                            Cancelar
                        </Button>
                        <Button type="submit" size="lg" className="h-14 px-10 text-lg font-black tracking-tight shadow-xl shadow-primary/20 rounded-2xl" disabled={isLoading}>
                            {isLoading ? (
                                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                            ) : (
                                <Save className="h-5 w-5 mr-2" />
                            )}
                            GERAR COTAÇÃO PÚBLICA
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </form>
    );
}
