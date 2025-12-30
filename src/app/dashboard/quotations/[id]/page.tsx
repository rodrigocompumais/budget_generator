import { notFound } from 'next/navigation';
import { getQuotationSummary } from '@/lib/quotation-service';
import { getUserFromToken } from '@/lib/auth-service';
import { getSessionToken } from '../../actions/auth-actions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trophy, Users, Package, AlertCircle, TrendingDown, Info } from 'lucide-react';

export default async function QuotationDashboardPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const token = await getSessionToken();
    const user = token ? getUserFromToken(token) : null;

    if (!user) return notFound();

    const summary = await getQuotationSummary(id, user.id);

    if (!summary) return notFound();

    // Calcular economia potencial (Diferença entre o mais caro e o mais barato de cada item)
    const potentialSavings = summary.items.reduce((acc, item) => {
        if (item.prices.length < 2) return acc;
        const maxPrice = Math.max(...item.prices.map((p: any) => p.value));
        const minPrice = item.bestPrice?.value || 0;
        return acc + (maxPrice - minPrice) * item.quantity;
    }, 0);

    return (
        <div className="flex flex-col gap-10 pb-20">
            {/* Header com KPIs */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase leading-none">
                        Dashboard: {summary.quotationTitle}
                    </h1>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mt-2">
                        Análise Comparativa de Preços
                    </p>
                </div>

                <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex flex-col items-center px-6 py-2 border-r border-slate-100">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Respostas</span>
                        <div className="flex items-center gap-2 mt-1">
                            <Users className="h-4 w-4 text-blue-500" />
                            <span className="text-xl font-black text-slate-900 tabular-nums">{summary.totalResponses}</span>
                        </div>
                    </div>
                    {potentialSavings > 0 && (
                        <div className="flex flex-col items-center px-6 py-2">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Economia Estimada</span>
                            <div className="flex items-center gap-2 mt-1">
                                <TrendingDown className="h-4 w-4 text-green-500" />
                                <span className="text-xl font-black text-green-600 tabular-nums">
                                    R$ {potentialSavings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Comparativo de Itens */}
            <div className="grid grid-cols-1 gap-8">
                <Card className="border-none shadow-xl rounded-3xl overflow-hidden overflow-x-auto">
                    <CardHeader className="bg-slate-900 text-white p-8">
                        <div className="flex items-center gap-3">
                            <Package className="h-5 w-5 text-blue-400" />
                            <CardTitle className="text-sm font-black uppercase tracking-[0.2em]">Relação de Produtos & Melhor Oferta</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-slate-50">
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="w-[30%] font-black uppercase text-[10px] tracking-widest text-slate-400 py-6 pl-8">Produto</TableHead>
                                    <TableHead className="w-[15%] font-black uppercase text-[10px] tracking-widest text-slate-400 py-6 text-center">Qtde</TableHead>
                                    <TableHead className="w-[20%] font-black uppercase text-[10px] tracking-widest text-slate-400 py-6 text-center">Melhor Valor Unit.</TableHead>
                                    <TableHead className="w-[25%] font-black uppercase text-[10px] tracking-widest text-slate-400 py-6">Fornecedor Ganahador</TableHead>
                                    <TableHead className="w-[10%] font-black uppercase text-[10px] tracking-widest text-slate-400 py-6 pr-8 text-right">Ação</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {summary.items.map((item) => (
                                    <TableRow key={item.id} className="hover:bg-slate-50/50 group">
                                        <TableCell className="py-6 pl-8">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-900">{item.title}</span>
                                                {item.description && <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest truncate max-w-xs">{item.description}</span>}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center font-bold text-slate-400 py-6 tabular-nums">
                                            {item.quantity} {item.unit}
                                        </TableCell>
                                        <TableCell className="text-center py-6">
                                            {item.bestPrice ? (
                                                <span className="inline-flex items-center gap-2 font-black text-green-600 bg-green-50 px-4 py-1.5 rounded-full text-sm">
                                                    R$ {item.bestPrice.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                </span>
                                            ) : (
                                                <span className="text-slate-300 font-bold italic text-xs">Pendente</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="py-6">
                                            {item.bestPrice ? (
                                                <div className="flex items-center gap-2">
                                                    <Trophy className="h-4 w-4 text-amber-400 bg-amber-50 rounded-full p-0.5" />
                                                    <span className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors uppercase text-xs tracking-tight">
                                                        {item.bestPrice.supplierName}
                                                    </span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 text-slate-300">
                                                    <AlertCircle className="h-4 w-4" />
                                                    <span className="text-xs font-bold italic">Aguardando fornecedores</span>
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="py-6 pr-8 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Badge variant="outline" className="rounded-full font-black text-[9px] uppercase tracking-widest py-0 px-2 h-5 border-slate-200 text-slate-400">
                                                    {item.prices.length} lances
                                                </Badge>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            {/* Detalhes de todas as respostas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {summary.items.filter(i => i.prices.length > 0).map((item) => (
                    <Card key={item.id} className="border-none shadow-sm rounded-3xl bg-white border border-slate-100 h-fit">
                        <CardHeader className="pb-4 border-b border-slate-50">
                            <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-400">Ranking para {item.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            {item.prices.sort((a: any, b: any) => a.value - b.value).map((p: any, idx: number) => (
                                <div key={idx} className={`flex items-center justify-between p-4 rounded-2xl ${idx === 0 ? 'bg-green-50 border border-green-100' : 'bg-slate-50'}`}>
                                    <div className="flex flex-col">
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${idx === 0 ? 'text-green-600' : 'text-slate-400'}`}>
                                            #{idx + 1} {p.supplierName}
                                        </span>
                                        <span className="text-lg font-black text-slate-900 tabular-nums">
                                            R$ {p.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                    {idx === 0 && <Trophy className="h-5 w-5 text-amber-500" />}
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {summary.totalResponses === 0 && (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                    <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                        <Info className="h-8 w-8 text-slate-300" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 uppercase">Nenhuma resposta ainda</h3>
                    <p className="text-slate-400 text-sm mt-2 max-w-xs text-center font-medium">Compartilhe o link da cotação com seus fornecedores para começar a comparar os preços.</p>
                </div>
            )}
        </div>
    );
}
