import { QuotationForm } from '@/components/quotation-form';

export default function NewQuotationPage() {
    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Nova Cotação</h1>
                <p className="text-muted-foreground">
                    Crie uma lista de produtos para enviar aos fornecedores.
                </p>
            </div>

            <QuotationForm />
        </div>
    );
}
