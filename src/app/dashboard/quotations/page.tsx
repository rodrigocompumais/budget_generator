import { Button } from '@/components/ui/button';
import { PlusCircle, Search } from 'lucide-react';
import Link from 'next/link';
import { getQuotations } from '@/lib/quotation-service';
import { getUserFromToken } from '@/lib/auth-service';
import { getSessionToken } from '../../actions/auth-actions';
import { QuotationList } from '@/components/quotation-list';
import { Input } from '@/components/ui/input';

export default async function QuotationsPage() {
    const token = await getSessionToken();
    const user = token ? getUserFromToken(token) : null;
    const quotations = user ? await getQuotations(user.id) : [];

    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-slate-900">Minhas Cotações</h1>
                    <p className="text-slate-500 uppercase text-[10px] font-black tracking-[0.3em] mt-1">
                        Gerenciamento de Fornecedores & Preços
                    </p>
                </div>
                <Button asChild className="h-12 px-6 rounded-2xl shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90">
                    <Link href="/dashboard/quotations/new">
                        <PlusCircle className="mr-2 h-5 w-5" /> Nova Cotação
                    </Link>
                </Button>
            </div>

            {quotations.length > 0 ? (
                <div className="space-y-6">
                    <div className="relative max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input placeholder="Buscar cotação..." className="pl-10 h-10 rounded-full border-slate-200 bg-white" />
                    </div>
                    <QuotationList quotations={quotations} />
                </div>
            ) : (
                <div className="flex flex-1 items-center justify-center rounded-3xl border border-dashed bg-white shadow-sm py-20 px-8">
                    <div className="flex flex-col items-center gap-6 text-center max-w-sm">
                        <div className="h-20 w-20 rounded-full bg-primary/5 flex items-center justify-center">
                            <PlusCircle className="h-10 w-10 text-primary/40" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-bold tracking-tight text-slate-900">
                                Sem cotações arquivadas
                            </h3>
                            <p className="text-sm text-slate-400">
                                Você ainda não iniciou nenhuma cotação externa. Comece agora para comparar preços de fornecedores.
                            </p>
                        </div>
                        <Button className="h-12 px-8 rounded-2xl" asChild>
                            <Link href="/dashboard/quotations/new">
                                <PlusCircle className="mr-2 h-5 w-5" /> Criar Primeira Cotação
                            </Link>
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
