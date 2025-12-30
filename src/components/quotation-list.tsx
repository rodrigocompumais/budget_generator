"use client";

import { Quotation } from '@/lib/types';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, FileText, Trash2, LayoutDashboard, Copy, ExternalLink } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

interface QuotationListProps {
    quotations: Quotation[];
}

export function QuotationList({ quotations }: QuotationListProps) {
    const { toast } = useToast();

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'aberta': return 'bg-blue-500 hover:bg-blue-600';
            case 'finalizada': return 'bg-green-500 hover:bg-green-600';
            case 'cancelada': return 'bg-red-500 hover:bg-red-600';
            default: return 'bg-gray-500 hover:bg-gray-600';
        }
    };

    const copyLink = (id: string) => {
        const url = `${window.location.origin}/quotation/${id}`;
        navigator.clipboard.writeText(url);
        toast({ title: 'Link copiado!', description: 'Compartilhe com seus fornecedores.' });
    };

    return (
        <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
            <Table>
                <TableHeader className="bg-slate-50">
                    <TableRow>
                        <TableHead className="font-bold py-4">Título</TableHead>
                        <TableHead className="font-bold py-4 text-center">Data</TableHead>
                        <TableHead className="font-bold py-4 text-center">Status</TableHead>
                        <TableHead className="text-right py-4 pr-6">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {quotations.map((q) => (
                        <TableRow key={q.id} className="hover:bg-slate-50/50">
                            <TableCell className="font-medium py-4">
                                <div className="flex flex-col">
                                    <span className="text-slate-900 font-bold">{q.title}</span>
                                    {q.description && <span className="text-[10px] text-slate-400 line-clamp-1 truncate uppercase tracking-widest font-black mt-1">{q.description}</span>}
                                </div>
                            </TableCell>
                            <TableCell className="text-center py-4 tabular-nums">
                                {format(new Date(q.createdAt), 'dd/MM/yyyy', { locale: ptBR })}
                            </TableCell>
                            <TableCell className="text-center py-4">
                                <Badge className={`${getStatusColor(q.status)} rounded-full px-4 border-none py-0.5 text-[10px] font-black uppercase tracking-widest`}>
                                    {q.status}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right py-4 pr-6">
                                <div className="flex items-center justify-end gap-2">
                                    <Button variant="outline" size="sm" className="h-8 rounded-full text-[10px] font-black uppercase tracking-widest border-slate-200" onClick={() => copyLink(q.id)}>
                                        <Copy className="mr-2 h-3 w-3" /> Copiar Link
                                    </Button>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0 rounded-full">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="rounded-xl p-2 w-56">
                                            <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">Gerenciamento</DropdownMenuLabel>
                                            <DropdownMenuItem asChild>
                                                <Link href={`/dashboard/quotations/${q.id}`} className="flex items-center gap-2 cursor-pointer font-bold">
                                                    <LayoutDashboard className="h-4 w-4 text-primary" /> Ver Dashboard
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild>
                                                <Link href={`/quotation/${q.id}`} target="_blank" className="flex items-center gap-2 cursor-pointer font-bold">
                                                    <ExternalLink className="h-4 w-4 text-slate-400" /> Abrir como Fornecedor
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="text-destructive flex items-center gap-2 cursor-pointer font-bold">
                                                <Trash2 className="h-4 w-4" /> Excluir Cotação
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
