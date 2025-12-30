"use client";

import { Budget } from '@/lib/types';
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
import { MoreHorizontal, FileText, Trash2, Edit } from 'lucide-react';
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

interface BudgetListProps {
    budgets: Budget[];
}

export function BudgetList({ budgets }: BudgetListProps) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'aprovado': return 'bg-green-500 hover:bg-green-600';
            case 'recusado': return 'bg-red-500 hover:bg-red-600';
            case 'enviado': return 'bg-blue-500 hover:bg-blue-600';
            default: return 'bg-gray-500 hover:bg-gray-600';
        }
    };

    if (budgets.length === 0) {
        return null; // Handle empty state in parent
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Número</TableHead>
                        <TableHead>Título</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {budgets.map((budget) => (
                        <TableRow key={budget.id}>
                            <TableCell className="font-medium">{budget.budgetNumber}</TableCell>
                            <TableCell>{budget.title}</TableCell>
                            <TableCell>{budget.client.name}</TableCell>
                            <TableCell>
                                {format(new Date(budget.issueDate), 'dd/MM/yyyy', { locale: ptBR })}
                            </TableCell>
                            <TableCell>
                                <Badge className={getStatusColor(budget.status)}>
                                    {budget.status.charAt(0).toUpperCase() + budget.status.slice(1)}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                        <DropdownMenuItem asChild>
                                            <Link href={`/dashboard/budgets/${budget.id}/edit`}>
                                                <Edit className="mr-2 h-4 w-4" /> Editar
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href={`/budget/${budget.id}`} target="_blank">
                                                <FileText className="mr-2 h-4 w-4" /> Visualizar Público
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem className="text-destructive">
                                            <Trash2 className="mr-2 h-4 w-4" /> Excluir
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
