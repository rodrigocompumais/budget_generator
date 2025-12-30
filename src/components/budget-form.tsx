"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PlusCircle, Trash2, Save, Plus, Loader2, Globe, QrCode, Link as LinkIcon, Info, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Client, Budget, BudgetOption, BudgetItem, BudgetStatus } from '@/lib/types';
import { createBudgetAction, updateBudgetAction } from '@/app/actions/budget-actions';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

interface BudgetFormProps {
    clients: Client[];
    initialData?: Budget;
}

export function BudgetForm({ clients, initialData }: BudgetFormProps) {
    const router = useRouter();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    // Form State
    const [title, setTitle] = useState(initialData?.title || '');
    const [budgetNumber, setBudgetNumber] = useState(initialData?.budgetNumber || `ORC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
    const [selectedClientId, setSelectedClientId] = useState(initialData?.client.id || '');
    const [responsible, setResponsible] = useState(initialData?.responsible || '');
    const [status, setStatus] = useState<BudgetStatus>(initialData?.status || 'rascunho');
    const [generalObservations, setGeneralObservations] = useState(initialData?.generalObservations || '');
    const [isPublic, setIsPublic] = useState(initialData?.isPublic ?? true);
    const [qrCodeLink, setQrCodeLink] = useState(initialData?.qrCodeLink || '');

    // Per-Budget Visual Settings
    const [primaryColor, setPrimaryColor] = useState(initialData?.primaryColor || '#3b82f6');
    const [accentColor, setAccentColor] = useState(initialData?.accentColor || '#10b981');
    const [backgroundColor, setBackgroundColor] = useState(initialData?.backgroundColor || '#f8fafc');

    const [options, setOptions] = useState<BudgetOption[]>(initialData?.options || [
        { id: '1', title: 'Opção 1', items: [{ id: '1', title: '', description: '', features: '', quantity: 1, prices: [{ id: 'p1', billingCycle: 'unico', value: 0 }], presentationLink: '' }], total: 0 }
    ]);

    // Fetch global defaults for colors if creating new
    useEffect(() => {
        if (!initialData) {
            fetch('/api/settings')
                .then(res => res.json())
                .then(data => {
                    if (data) {
                        if (data.primaryColor) setPrimaryColor(data.primaryColor);
                        if (data.accentColor) setAccentColor(data.accentColor);
                        if (data.backgroundColor) setBackgroundColor(data.backgroundColor);
                    }
                })
                .catch(err => console.error('Error fetching default settings:', err));
        }
    }, [initialData]);

    // Calculate totals whenever options/items change
    useEffect(() => {
        const updatedOptions = options.map(opt => {
            // Total is sum of (quantity * UNICO prices)
            const total = opt.items.reduce((sum, item) => {
                const itemUnico = (item.prices || [])
                    .filter(p => p.billingCycle === 'unico')
                    .reduce((pSum, p) => pSum + (p.value * item.quantity), 0);
                return sum + itemUnico;
            }, 0);

            // Calculate recurring totals
            const totalMensal = opt.items.reduce((sum, item) => {
                const itemMensal = (item.prices || [])
                    .filter(p => p.billingCycle === 'mensal')
                    .reduce((pSum, p) => pSum + (p.value * item.quantity), 0);
                return sum + itemMensal;
            }, 0);

            const totalAnual = opt.items.reduce((sum, item) => {
                const itemAnual = (item.prices || [])
                    .filter(p => p.billingCycle === 'anual')
                    .reduce((pSum, p) => pSum + (p.value * item.quantity), 0);
                return sum + itemAnual;
            }, 0);

            return { ...opt, total, totalMensal, totalAnual };
        });

        const totalsChanged = updatedOptions.some((opt, idx) =>
            opt.total !== (options[idx]?.total || 0) ||
            opt.totalMensal !== (options[idx]?.totalMensal || 0) ||
            opt.totalAnual !== (options[idx]?.totalAnual || 0)
        );

        if (totalsChanged) {
            setOptions(updatedOptions);
        }
    }, [options]);

    const addOption = () => {
        setOptions([...options, {
            id: Date.now().toString(),
            title: `Opção ${options.length + 1}`,
            items: [{ id: Date.now().toString() + '-1', title: '', description: '', features: '', quantity: 1, prices: [{ id: Date.now().toString() + '-p', billingCycle: 'unico', value: 0 }], presentationLink: '' }],
            total: 0
        }]);
    };

    const removeOption = (index: number) => {
        if (options.length > 1) {
            setOptions(options.filter((_, i) => i !== index));
        }
    };

    const addItem = (optIndex: number) => {
        const newOptions = [...options];
        newOptions[optIndex].items.push({
            id: Date.now().toString(),
            title: '',
            description: '',
            features: '',
            quantity: 1,
            prices: [{ id: Date.now().toString() + '-p', billingCycle: 'unico', value: 0 }],
            presentationLink: ''
        });
        setOptions(newOptions);
    };

    const removeItem = (optIndex: number, itemIndex: number) => {
        const newOptions = [...options];
        if (newOptions[optIndex].items.length > 1) {
            newOptions[optIndex].items = newOptions[optIndex].items.filter((_, i) => i !== itemIndex);
            setOptions(newOptions);
        }
    };

    const handleItemChange = (optIdx: number, itemIdx: number, field: keyof BudgetItem, value: any) => {
        const newOptions = [...options];
        (newOptions[optIdx].items[itemIdx] as any)[field] = value;
        setOptions(newOptions);
    };

    const addPrice = (optIdx: number, itemIdx: number) => {
        const newOptions = [...options];
        const item = newOptions[optIdx].items[itemIdx];
        if (!item.prices) item.prices = [];
        item.prices.push({
            id: Date.now().toString(),
            billingCycle: 'unico',
            value: 0
        });
        setOptions(newOptions);
    };

    const removePrice = (optIdx: number, itemIdx: number, priceIdx: number) => {
        const newOptions = [...options];
        const item = newOptions[optIdx].items[itemIdx];
        if (item.prices.length > 1) {
            item.prices = item.prices.filter((_, i) => i !== priceIdx);
            setOptions(newOptions);
        }
    };

    const handlePriceChange = (optIdx: number, itemIdx: number, priceIdx: number, field: string, value: any) => {
        const newOptions = [...options];
        const item = newOptions[optIdx].items[itemIdx];
        (item.prices[priceIdx] as any)[field] = value;
        setOptions(newOptions);
    };

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        const client = clients.find(c => c.id === selectedClientId);
        if (!client) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Selecione um cliente.' });
            return;
        }

        setIsLoading(true);
        try {
            const budgetData = {
                title,
                budgetNumber,
                issueDate: initialData?.issueDate || new Date().toISOString(),
                client,
                responsible,
                status,
                generalObservations,
                options,
                isPublic,
                qrCodeLink: qrCodeLink || '',
                primaryColor,
                accentColor,
                backgroundColor
            };

            const result = initialData
                ? await updateBudgetAction(initialData.id, budgetData)
                : await createBudgetAction(budgetData);

            if (result.success) {
                toast({
                    title: initialData ? 'Orçamento atualizado!' : 'Orçamento criado!',
                    description: 'Salvo com sucesso no banco de dados.'
                });
                router.push('/dashboard/budgets');
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
        <form onSubmit={handleSubmit} className="space-y-8 pb-12">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-3 space-y-8">
                    <Card className="border-none shadow-sm overflow-hidden rounded-2xl">
                        <CardHeader className="bg-primary/5 py-4 border-b">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Info className="h-5 w-5 text-primary" /> {initialData ? 'Editar Projeto' : 'Informações do Projeto'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                            <div className="space-y-2">
                                <Label htmlFor="title" className="text-xs uppercase font-black tracking-widest opacity-50">Título do Orçamento *</Label>
                                <Input id="title" value={title} onChange={e => setTitle(e.target.value)} required placeholder="Ex: Campanha de Marketing 2024" className="h-12 text-lg font-bold" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="client" className="text-xs uppercase font-black tracking-widest opacity-50">Selecione o Cliente *</Label>
                                <Select value={selectedClientId} onValueChange={setSelectedClientId} required>
                                    <SelectTrigger className="h-12 border-slate-200">
                                        <SelectValue placeholder="Selecione um cliente" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {clients.map(client => (
                                            <SelectItem key={client.id} value={client.id}>{client.name} {client.company ? `(${client.company})` : ''}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="budgetNumber" className="text-xs uppercase font-black tracking-widest opacity-50">Número Identificador</Label>
                                <Input id="budgetNumber" value={budgetNumber} onChange={e => setBudgetNumber(e.target.value)} className="h-12 font-mono" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="responsible" className="text-xs uppercase font-black tracking-widest opacity-50">Responsável pela Emissão</Label>
                                <Input id="responsible" value={responsible} onChange={e => setResponsible(e.target.value)} placeholder="Seu nome" className="h-12" />
                            </div>
                        </CardContent>
                    </Card>

                    {options.map((option, optIdx) => (
                        <Card key={option.id} className="overflow-hidden border-none shadow-md rounded-2xl">
                            <CardHeader className="flex flex-row items-center justify-between bg-slate-900 py-4 px-6">
                                <div className="flex-1 flex items-center gap-4">
                                    <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center font-black text-white text-sm">
                                        {optIdx + 1}
                                    </div>
                                    <Input
                                        className="text-lg font-black bg-transparent border-none p-0 focus-visible:ring-0 text-white uppercase tracking-tight w-full placeholder:text-white/30"
                                        value={option.title}
                                        onChange={e => {
                                            const newOpts = [...options];
                                            newOpts[optIdx].title = e.target.value;
                                            setOptions(newOpts);
                                        }}
                                        placeholder="Ex: OPÇÃO PADRÃO"
                                    />
                                </div>
                                <Button type="button" variant="ghost" size="sm" onClick={() => removeOption(optIdx)} disabled={options.length === 1} className="text-white/50 hover:text-white hover:bg-white/10">
                                    <Trash2 className="h-4 w-4 mr-2" /> Remover
                                </Button>
                            </CardHeader>
                            <CardContent className="p-0 bg-white">
                                <div className="divide-y divide-slate-100">
                                    {option.items.map((item, itemIdx) => (
                                        <div key={item.id} className="p-8 group hover:bg-slate-50/50 transition-colors">
                                            <div className="flex flex-col md:flex-row gap-8">
                                                <div className="flex-1 space-y-6">
                                                    <div className="space-y-4">
                                                        <div className="flex items-center justify-between">
                                                            <Label className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400">Valores / Ciclo de Faturamento</Label>
                                                            <Button type="button" variant="outline" size="sm" onClick={() => addPrice(optIdx, itemIdx)} className="h-7 text-[9px] font-black uppercase tracking-widest px-3 rounded-full border-slate-200">
                                                                + Adicionar Preço
                                                            </Button>
                                                        </div>
                                                        <div className="space-y-3">
                                                            {(item.prices || []).map((price, priceIdx) => (
                                                                <div key={price.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                                                                    <div className="md:col-span-6 space-y-2">
                                                                        <Label className="text-[9px] font-black text-slate-400 uppercase">Ciclo</Label>
                                                                        <Select value={price.billingCycle} onValueChange={val => handlePriceChange(optIdx, itemIdx, priceIdx, 'billingCycle', val)}>
                                                                            <SelectTrigger className="h-10 border-slate-200 bg-white">
                                                                                <SelectValue />
                                                                            </SelectTrigger>
                                                                            <SelectContent>
                                                                                <SelectItem value="unico">Pagamento Único</SelectItem>
                                                                                <SelectItem value="mensal">Recorrência Mensal</SelectItem>
                                                                                <SelectItem value="anual">Recorrência Anual</SelectItem>
                                                                            </SelectContent>
                                                                        </Select>
                                                                    </div>
                                                                    <div className="md:col-span-5 space-y-2">
                                                                        <Label className="text-[9px] font-black text-slate-400 uppercase">Valor Unitário</Label>
                                                                        <Input
                                                                            type="number"
                                                                            value={price.value}
                                                                            onChange={e => handlePriceChange(optIdx, itemIdx, priceIdx, 'value', parseFloat(e.target.value) || 0)}
                                                                            className="h-10 border-slate-200 bg-white font-bold"
                                                                        />
                                                                    </div>
                                                                    <div className="md:col-span-1">
                                                                        <Button
                                                                            type="button"
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            onClick={() => removePrice(optIdx, itemIdx, priceIdx)}
                                                                            className="h-10 w-10 text-slate-300 hover:text-red-500"
                                                                            disabled={(item.prices || []).length <= 1}
                                                                        >
                                                                            <Trash2 size={14} />
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        <div className="space-y-2">
                                                            <Label className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400 flex items-center gap-2">
                                                                <LinkIcon className="h-3 w-3" /> Link de Apresentação (Botão/QR)
                                                            </Label>
                                                            <Input value={item.presentationLink || ''} onChange={e => handleItemChange(optIdx, itemIdx, 'presentationLink', e.target.value)} placeholder="https://..." className="border-slate-200" />
                                                        </div>
                                                        <div className="space-y-2 opacity-0 select-none">
                                                            <Label className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400">Espaçador</Label>
                                                            <Input disabled className="border-transparent bg-transparent" />
                                                        </div>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400">Descrição Detalhada</Label>
                                                        <Textarea value={item.description} onChange={e => handleItemChange(optIdx, itemIdx, 'description', e.target.value)} placeholder="Descreva os benefícios e o que está incluso..." rows={2} className="border-slate-200" />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400 flex items-center gap-2">
                                                            <Plus className="h-3 w-3" /> Especificações / Bullets (Um por linha)
                                                        </Label>
                                                        <Textarea
                                                            value={item.features}
                                                            onChange={e => handleItemChange(optIdx, itemIdx, 'features', e.target.value)}
                                                            placeholder="Vantagem 1&#10;Vantagem 2&#10;Vantagem 3"
                                                            rows={3}
                                                            className="text-sm font-medium border-slate-200"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="w-full md:w-56 space-y-4 md:border-l border-slate-100 md:pl-8">
                                                    <div className="space-y-2">
                                                        <Label className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400">Título do Produto/Serviço</Label>
                                                        <Input value={item.title} onChange={e => handleItemChange(optIdx, itemIdx, 'title', e.target.value)} className="border-slate-200 h-10 font-bold" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400">Quantidade</Label>
                                                        <Input type="number" value={item.quantity} onChange={e => handleItemChange(optIdx, itemIdx, 'quantity', Number(e.target.value))} className="border-slate-200 h-10 font-bold" />
                                                    </div>
                                                    <div className="pt-4 mt-4 border-t border-slate-100 flex justify-between items-end">
                                                        <div>
                                                            <p className="text-[8px] uppercase font-black text-slate-400 tracking-widest">Total Único</p>
                                                            <div className="text-xl font-black text-primary">
                                                                R$ {((item.prices || []).filter(p => p.billingCycle === 'unico').reduce((s, p) => s + (p.value * item.quantity), 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                            </div>
                                                        </div>
                                                        <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(optIdx, itemIdx)} disabled={option.items.length === 1} className="text-destructive h-8 w-8 hover:bg-destructive/5">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="p-6 bg-slate-50 border-t flex flex-col md:flex-row justify-between items-center gap-6">
                                    <Button type="button" variant="outline" size="sm" onClick={() => addItem(optIdx)} className="rounded-full px-6 border-slate-200">
                                        <Plus className="h-4 w-4 mr-2" /> Adicionar Outro Item à {option.title}
                                    </Button>
                                    <div className="text-center md:text-right">
                                        <span className="text-[10px] text-slate-400 uppercase font-black tracking-[0.2em]">Total da Opção</span>
                                        <div className="text-3xl font-black text-slate-900 tabular-nums leading-none">R$ {option.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    <Button type="button" variant="outline" className="w-full border-dashed border-2 py-12 bg-white hover:bg-slate-50 hover:border-primary/50 transition-all group rounded-3xl" onClick={addOption}>
                        <div className="flex flex-col items-center gap-3">
                            <PlusCircle className="h-10 w-10 text-slate-300 group-hover:text-primary transition-colors" />
                            <span className="text-lg font-black text-slate-400 group-hover:text-slate-900 transition-colors uppercase tracking-tight">Adicionar Alternativa de Orçamento</span>
                        </div>
                    </Button>
                </div>

                <div className="space-y-8">
                    {/* Visual Customization Card */}
                    <Card className="border-none shadow-lg rounded-2xl overflow-hidden">
                        <CardHeader className="bg-slate-900 py-4">
                            <CardTitle className="text-sm text-white flex items-center gap-2 uppercase tracking-widest font-black">
                                <Palette className="h-4 w-4" /> Branding da Proposta
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6 bg-white">
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Cor Principal</Label>
                                        <div className="flex gap-2">
                                            <Input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="h-10 w-10 p-0 border-none bg-transparent cursor-pointer" />
                                            <Input value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="h-10 text-[10px] font-mono font-bold" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Destaque</Label>
                                        <div className="flex gap-2">
                                            <Input type="color" value={accentColor} onChange={e => setAccentColor(e.target.value)} className="h-10 w-10 p-0 border-none bg-transparent cursor-pointer" />
                                            <Input value={accentColor} onChange={e => setAccentColor(e.target.value)} className="h-10 text-[10px] font-mono font-bold" />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Cor de Fundo da Página</Label>
                                    <div className="flex gap-4 items-center">
                                        <Input type="color" value={backgroundColor} onChange={e => setBackgroundColor(e.target.value)} className="h-10 w-10 p-0 border-none bg-transparent cursor-pointer" />
                                        <Input value={backgroundColor} onChange={e => setBackgroundColor(e.target.value)} className="h-10 flex-1 text-[10px] font-mono font-bold" />
                                    </div>
                                </div>
                            </div>
                            <div className="h-px bg-slate-100"></div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-xs font-black uppercase tracking-widest text-slate-900">Página Pública</Label>
                                    <p className="text-[9px] text-slate-400 uppercase font-black">Liberar acesso via link</p>
                                </div>
                                <Switch checked={isPublic} onCheckedChange={setIsPublic} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="sticky top-8 border-none shadow-lg rounded-2xl overflow-hidden">
                        <CardHeader className="bg-primary pt-6 pb-2">
                            <CardTitle className="text-white text-xs uppercase tracking-widest font-black">Finalização</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6 bg-white">
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400"><QrCode className="h-3 w-3" /> QR Code Geral (Opcional)</Label>
                                <Input
                                    value={qrCodeLink}
                                    onChange={e => setQrCodeLink(e.target.value)}
                                    placeholder="Link personalizado"
                                    className="text-xs h-10"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status da Proposta</Label>
                                <Select value={status} onValueChange={(val: BudgetStatus) => setStatus(val)}>
                                    <SelectTrigger className="h-10 font-bold border-slate-200">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="rascunho">Rascunho</SelectItem>
                                        <SelectItem value="enviado">Enviado</SelectItem>
                                        <SelectItem value="aprovado">Aprovado</SelectItem>
                                        <SelectItem value="recusado">Recusado</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2 pt-4 border-t">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Considerações Finais</Label>
                                <Textarea
                                    value={generalObservations}
                                    onChange={e => setGeneralObservations(e.target.value)}
                                    placeholder="Validade, condições de pagamento..."
                                    rows={8}
                                    className="text-xs border-slate-200"
                                />
                            </div>

                            <div className="flex flex-col gap-3 pt-4">
                                <Button type="submit" size="lg" className="w-full h-16 text-lg font-black tracking-tight shadow-xl shadow-primary/20 rounded-2xl" disabled={isLoading}>
                                    {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Save className="h-6 w-6 mr-3" />}
                                    {initialData ? 'SALVAR ALTERAÇÕES' : 'GERAR PROPOSTA'}
                                </Button>
                                <Button variant="ghost" type="button" className="w-full text-slate-400 h-12" asChild disabled={isLoading}>
                                    <Link href="/dashboard/budgets">
                                        {initialData ? 'Voltar sem Salvar' : 'Descartar Proposta'}
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </form>
    );
}
