import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Painel Principal</h1>
        <p className="text-muted-foreground">
          Bem-vindo! Aqui estão os seus orçamentos recentes.
        </p>
      </div>
      <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm">
        <div className="flex flex-col items-center gap-2 text-center p-8">
          <h3 className="text-2xl font-bold tracking-tight">
            Ainda não tem orçamentos
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Comece a criar orçamentos profissionais para os seus clientes com apenas alguns cliques.
          </p>
          <Button className="mt-4" asChild>
            <Link href="/dashboard/budgets/new">
              <PlusCircle className="mr-2 h-4 w-4" /> Criar Orçamento
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
