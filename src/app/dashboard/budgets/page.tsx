import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { getBudgets } from '@/lib/budget-service';
import { getUserFromToken } from '@/lib/auth-service';
import { getSessionToken } from '../../actions/auth-actions';
import { BudgetList } from '@/components/budget-list';

export default async function BudgetsPage() {
    const token = await getSessionToken();
    const user = token ? getUserFromToken(token) : null;
    const budgets = user ? await getBudgets(user.id) : [];

    return (
        <div className="flex flex-col gap-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Meus Orçamentos</h1>
                    <p className="text-muted-foreground">
                        Gerencie e acompanhe todos os seus orçamentos.
                    </p>
                </div>
                <Button asChild>
                    <Link href="/dashboard/budgets/new">
                        <PlusCircle className="mr-2 h-4 w-4" /> Novo Orçamento
                    </Link>
                </Button>
            </div>

            {budgets.length > 0 ? (
                <BudgetList budgets={budgets} />
            ) : (
                <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm py-12">
                    <div className="flex flex-col items-center gap-2 text-center p-8">
                        <h3 className="text-2xl font-bold tracking-tight">
                            Nenhum orçamento encontrado
                        </h3>
                        <p className="text-sm text-muted-foreground max-w-sm">
                            Você ainda não criou nenhum orçamento. Comece agora mesmo!
                        </p>
                        <Button className="mt-4" asChild>
                            <Link href="/dashboard/budgets/new">
                                <PlusCircle className="mr-2 h-4 w-4" /> Criar Orçamento
                            </Link>
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
