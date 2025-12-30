import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { getClients } from '@/lib/client-service';
import { getUserFromToken } from '@/lib/auth-service';
import { getSessionToken } from '../../../actions/auth-actions';
import { BudgetForm } from '@/components/budget-form';

export default async function NewBudgetPage() {
    const token = await getSessionToken();
    const user = token ? getUserFromToken(token) : null;
    const clients = user ? await getClients(user.id) : [];

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/dashboard/budgets">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <h1 className="text-3xl font-bold tracking-tight">Novo Orçamento</h1>
            </div>

            <BudgetForm clients={clients} />
        </div>
    );
}
