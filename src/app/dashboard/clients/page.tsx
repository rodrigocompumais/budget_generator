import { Button } from '@/components/ui/button';
import { PlusCircle, Search, Mail, Phone, Building2, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { getClients } from '@/lib/client-service';
import { getUserFromToken } from '@/lib/auth-service';
import { getSessionToken } from '../../actions/auth-actions';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default async function ClientsPage() {
    const token = await getSessionToken();
    const user = token ? getUserFromToken(token) : null;
    const clients = user ? await getClients(user.id) : [];

    return (
        <div className="flex flex-col gap-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
                    <p className="text-muted-foreground">
                        Gerencie sua base de clientes para facilitar a criação de orçamentos.
                    </p>
                </div>
                <Button asChild>
                    <Link href="/dashboard/clients/new">
                        <PlusCircle className="mr-2 h-4 w-4" /> Novo Cliente
                    </Link>
                </Button>
            </div>

            {clients.length > 0 ? (
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nome</TableHead>
                                <TableHead>Empresa</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Telefone</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {clients.map((client) => (
                                <TableRow key={client.id}>
                                    <TableCell className="font-medium">{client.name}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center">
                                            <Building2 className="mr-2 h-4 w-4 text-muted-foreground" />
                                            {client.company || '-'}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center">
                                            <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                                            {client.email}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {client.phone ? (
                                            <div className="flex items-center">
                                                <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                                                {client.phone}
                                            </div>
                                        ) : '-'}
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
                                                    <Link href={`/dashboard/clients/${client.id}/edit`}>
                                                        <Edit className="mr-2 h-4 w-4" /> Editar
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
            ) : (
                <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm py-12">
                    <div className="flex flex-col items-center gap-2 text-center p-8">
                        <h3 className="text-2xl font-bold tracking-tight">
                            Nenhum cliente encontrado
                        </h3>
                        <p className="text-sm text-muted-foreground max-w-sm">
                            Você ainda não cadastrou nenhum cliente. Adicione um agora para começar!
                        </p>
                        <Button className="mt-4" asChild>
                            <Link href="/dashboard/clients/new">
                                <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Cliente
                            </Link>
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
