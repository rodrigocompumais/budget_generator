import { getQuotationForSupplier } from '@/lib/quotation-service';
import { notFound } from 'next/navigation';
import { QuotationResponseForm } from '@/components/quotation-response-form';
import { Package, CalendarDays, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default async function PublicQuotationPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const quotation = await getQuotationForSupplier(id);

    if (!quotation) {
        return notFound();
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            {/* Header / Hero */}
            <div className="bg-white border-b border-slate-100">
                <div className="max-w-5xl mx-auto px-6 py-12">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 bg-blue-50 px-3 py-1 rounded-full w-fit">
                                <Package className="h-3 w-3" /> Solicitação de Cotação
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black text-slate-900 uppercase tracking-tight leading-none">
                                {quotation.title}
                            </h1>
                            <div className="flex items-center gap-6 text-sm font-bold text-slate-400">
                                <div className="flex items-center gap-2">
                                    <CalendarDays className="h-4 w-4" />
                                    {format(new Date(quotation.createdAt), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                                    Status: Aberto
                                </div>
                            </div>
                        </div>
                        {quotation.description && (
                            <div className="max-w-md bg-slate-50 p-6 rounded-3xl border border-slate-100">
                                <p className="text-sm font-medium text-slate-600 leading-relaxed italic">
                                    "{quotation.description}"
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="max-w-5xl mx-auto px-6 py-16">
                <div className="mb-12">
                    <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-4">
                        Preencher Proposta <ArrowRight className="h-6 w-6 text-blue-500" />
                    </h2>
                    <p className="text-slate-400 font-medium mt-2">Informe seus melhores valores unitários para cada item listado abaixo.</p>
                </div>

                <QuotationResponseForm quotation={quotation} />
            </main>

            {/* Footer */}
            <footer className="py-20 border-t border-slate-100 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">
                    TechQuote Pro - Sistema de Gestão de Cotações
                </p>
            </footer>
        </div>
    );
}
