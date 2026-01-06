"use client";

import { useState } from 'react';
import { Quotation, QuotationResponseItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle2, Send, Loader2, Building2, User, Info } from 'lucide-react';
import { saveQuotationResponseAction } from '@/app/actions/quotation-actions';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface QuotationResponseFormProps {
    quotation: Quotation;
}

export function QuotationResponseForm({ quotation }: QuotationResponseFormProps) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const [supplierName, setSupplierName] = useState('');
    const [supplierContact, setSupplierContact] = useState('');

    const [itemValues, setItemValues] = useState<Record<string, { value: number, obs: string }>>(
        quotation.items.reduce((acc, item) => ({
            ...acc,
            [item.id]: { value: 0, obs: '' }
        }), {})
    );

    const handleValueChange = (itemId: string, value: string) => {
        setItemValues(prev => ({
            ...prev,
            [itemId]: { ...prev[itemId], value: parseFloat(value) || 0 }
        }));
    };

    const handleObsChange = (itemId: string, obs: string) => {
        setItemValues(prev => ({
            ...prev,
            [itemId]: { ...prev[itemId], obs }
        }));
    };

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (!supplierName || !supplierContact) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Por favor, identifique sua empresa e contato.' });
            return;
        }

        setIsLoading(true);
        try {
            const responseItems: Omit<QuotationResponseItem, 'id' | 'responseId'>[] = Object.entries(itemValues).map(([itemId, data]) => ({
                itemId,
                unitValue: data.value,
                observations: data.obs
            }));

            const result = await saveQuotationResponseAction({
                quotationId: quotation.id,
                supplierName,
                supplierContact,
                items: responseItems as any
            });

            if (result.success) {
                setIsSubmitted(true);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                toast({ variant: 'destructive', title: 'Erro', description: result.error || 'Erro ao enviar resposta.' });
            }
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Erro', description: 'Erro inesperado ao enviar.' });
        } finally {
            setIsLoading(false);
        }
    }

    if (isSubmitted) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-500">
                <div className="h-24 w-24 rounded-full bg-green-50 flex items-center justify-center mb-8">
                    <CheckCircle2 className="h-12 w-12 text-green-500" />
                </div>
                <h2 className="text-3xl font-black text-slate-900 mb-4 uppercase tracking-tight">Proposta Enviada!</h2>
                <p className="text-slate-500 max-w-md mx-auto leading-relaxed">
                    Sua cotação para <strong>{quotation.title}</strong> foi recebida com sucesso. Agradecemos sua participação.
                </p>
                <Button variant="outline" className="mt-10 rounded-full" onClick={() => window.location.reload()}>
                    Enviar Outra Resposta
                </Button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-10">
            <Card className="border-none shadow-xl rounded-3xl overflow-hidden">
                <CardHeader className="bg-slate-900 text-white p-8">
                    <div className="flex items-center gap-3 mb-2">
                        <Building2 className="h-5 w-5 text-blue-400" />
                        <CardTitle className="text-sm font-black uppercase tracking-[0.2em]">Sua Identificação</CardTitle>
                    </div>
                    <CardDescription className="text-slate-400 font-medium">Forneça seus dados para que possamos analisar sua proposta.</CardDescription>
                </CardHeader>
                <CardContent className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nome da Empresa / Vendedor</Label>
                        <Input
                            placeholder="Ex: Tecnologia LTDA"
                            value={supplierName}
                            onChange={e => setSupplierName(e.target.value)}
                            className="h-14 font-bold rounded-2xl border-slate-200 focus:ring-slate-900 focus:border-slate-900"
                            required
                        />
                    </div>
                    <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">E-mail ou Telefone de Contato</Label>
                        <Input
                            placeholder="Ex: contato@empresa.com"
                            value={supplierContact}
                            onChange={e => setSupplierContact(e.target.value)}
                            className="h-14 font-bold rounded-2xl border-slate-200 focus:ring-slate-900 focus:border-slate-900"
                            required
                        />
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-6">
                <div className="flex items-center gap-3 px-2">
                    <div className="h-8 w-1 bg-slate-900 rounded-full"></div>
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Relação de Produtos</h3>
                </div>

                {quotation.items.map((item) => (
                    <Card key={item.id} className="border-none shadow-md rounded-3xl overflow-hidden hover:shadow-lg transition-shadow">
                        <CardContent className="p-8">
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                                <div className="lg:col-span-5 space-y-2">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Badge variant="outline" className="rounded-full border-slate-200 text-slate-400 font-bold uppercase text-[9px]">
                                            {item.quantity} {item.unit}
                                        </Badge>
                                    </div>
                                    <h4 className="text-lg font-black text-slate-900 leading-tight">{item.title}</h4>
                                    {item.description && (
                                        <p className="text-sm text-slate-500 font-medium leading-relaxed">{item.description}</p>
                                    )}
                                </div>

                                <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-5 gap-6 items-end">
                                    <div className="sm:col-span-2 space-y-3">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Valor Unitário (R$)</Label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">R$</span>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                placeholder="0,00"
                                                value={itemValues[item.id].value || ''}
                                                onChange={e => handleValueChange(item.id, e.target.value)}
                                                className="h-14 pl-12 font-black text-xl rounded-2xl border-slate-200 text-slate-900"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="sm:col-span-3 space-y-3">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Observação sobre o item</Label>
                                        <Input
                                            placeholder="Ex: Prazo de 5 dias, marca X..."
                                            value={itemValues[item.id].obs}
                                            onChange={e => handleObsChange(item.id, e.target.value)}
                                            className="h-14 font-medium rounded-2xl border-slate-100 bg-slate-50 focus:bg-white"
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="pt-10 flex flex-col items-center">
                <Button
                    type="submit"
                    size="lg"
                    className="h-20 px-12 text-xl font-black rounded-3xl shadow-2xl shadow-blue-500/20 bg-slate-900 hover:bg-slate-800 transition-all hover:scale-[1.02]"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <Loader2 className="h-6 w-6 animate-spin mr-3" />
                    ) : (
                        <Send className="h-6 w-6 mr-3" />
                    )}
                    FINALIZAR E ENVIAR COTAÇÃO
                </Button>
                <div className="flex items-center gap-2 mt-6 text-slate-400">
                    <Info className="h-4 w-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Sua resposta será salva e comparada com outros fornecedores.</span>
                </div>
            </div>
        </form>
    );
}
