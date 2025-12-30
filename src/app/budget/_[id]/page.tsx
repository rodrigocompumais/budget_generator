import { getBudgetById } from '@/lib/budget-service';
import { getVisualSettings } from '@/lib/visual-service';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Mail, Phone, Building2, Download } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import db from '@/lib/db';

interface PublicBudgetPageProps {
    params: Promise<{ id: string }>;
}

export default async function PublicBudgetPage({ params }: PublicBudgetPageProps) {
    const { id } = await params;

    // Check if budget is public and get the user_id
    const row = db.prepare(`SELECT user_id, public_link, qr_code_link FROM budgets WHERE id = ? AND is_public = 1`).get(id) as { user_id: string, public_link: string, qr_code_link: string } | undefined;

    if (!row) return notFound();

    const fullBudget = await getBudgetById(id, row.user_id);
    if (!fullBudget) return notFound();

    const settings = await getVisualSettings(row.user_id);

    const visualSettings = {
        primaryColor: settings?.primaryColor || '#3b82f6',
        backgroundColor: settings?.backgroundColor || '#ffffff',
        accentColor: settings?.accentColor || '#10b981',
        fontFamily: settings?.fontFamily || 'Inter',
        companyName: settings?.companyName || 'Proposta Comercial',
        companyLogoUrl: settings?.companyLogoUrl,
        showQrCode: settings?.showQrCode ?? true,
        customFooter: settings?.customFooter
    };

    // QR Code generation URL
    const qrData = row.qr_code_link || row.public_link || `https://budget-generator.local/budget/${id}`;
    const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrData)}`;

    return (
        <div className="min-h-screen pb-12" style={{ backgroundColor: visualSettings.backgroundColor, fontFamily: visualSettings.fontFamily }}>
            {/* Header / Branding */}
            <header className="border-b bg-white shadow-sm mb-8 print:hidden">
                <div className="container mx-auto px-4 h-24 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {visualSettings.companyLogoUrl ? (
                            <img src={visualSettings.companyLogoUrl} alt="Logo" className="h-12 object-contain" />
                        ) : (
                            <div className="h-12 w-12 rounded flex items-center justify-center text-white font-bold text-2xl" style={{ backgroundColor: visualSettings.primaryColor }}>
                                {visualSettings.companyName?.charAt(0) || 'P'}
                            </div>
                        )}
                        <h1 className="text-xl font-bold">{visualSettings.companyName}</h1>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => window.print()} className="hidden md:flex">
                            <Download className="mr-2 h-4 w-4" /> PDF / Imprimir
                        </Button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 max-w-5xl">
                {/* Budget Master Info */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden mb-8 print:shadow-none print:border-b">
                    <div className="p-8 border-b border-gray-100 flex flex-col md:row justify-between gap-6" style={{ borderLeft: `6px solid ${visualSettings.primaryColor}` }}>
                        <div className="flex-1">
                            <h2 className="text-3xl font-bold mb-2">{fullBudget.title}</h2>
                            <p className="text-muted-foreground">Proposta preparada para: <strong>{fullBudget.client.name}</strong></p>
                        </div>
                        <div className="text-right flex flex-col items-end gap-4">
                            <div>
                                <span className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Proposta nº</span>
                                <div className="text-2xl font-mono font-bold" style={{ color: visualSettings.primaryColor }}>{fullBudget.budgetNumber}</div>
                                <div className="text-sm text-muted-foreground">{format(new Date(fullBudget.issueDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</div>
                            </div>

                            {visualSettings.showQrCode && (
                                <div className="p-2 border rounded-lg bg-white print:block">
                                    <img src={qrCodeImageUrl} alt="QR Code da Proposta" className="w-24 h-24" />
                                    <p className="text-[10px] text-center mt-1 text-muted-foreground">Acesse via celular</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 bg-gray-50/50 print:bg-transparent">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Informações do Cliente</h3>
                            <div className="space-y-2">
                                <p className="font-bold text-lg">{fullBudget.client.name}</p>
                                {fullBudget.client.company && <p className="flex items-center text-muted-foreground"><Building2 className="mr-2 h-4 w-4" /> {fullBudget.client.company}</p>}
                                <p className="flex items-center text-muted-foreground"><Mail className="mr-2 h-4 w-4" /> {fullBudget.client.email}</p>
                                {fullBudget.client.phone && <p className="flex items-center text-muted-foreground"><Phone className="mr-2 h-4 w-4" /> {fullBudget.client.phone}</p>}
                            </div>
                        </div>
                        <div className="text-left md:text-right">
                            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Responsável</h3>
                            <p className="font-bold text-lg">{fullBudget.responsible || visualSettings.companyName}</p>
                        </div>
                    </div>
                </div>

                {/* Options */}
                <div className="space-y-12">
                    {fullBudget.options.map((option, idx) => (
                        <div key={option.id} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden print:shadow-none print:border">
                            <div className="p-6 text-white flex justify-between items-center" style={{ backgroundColor: visualSettings.primaryColor }}>
                                <h3 className="text-xl font-bold">{option.title}</h3>
                                <div className="text-2xl font-bold">R$ {option.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                            </div>

                            <div className="p-0">
                                {option.items.map((item, iIdx) => (
                                    <div key={item.id} className={`p-6 ${iIdx !== option.items.length - 1 ? 'border-b border-gray-100' : ''}`}>
                                        <div className="flex justify-between mb-2">
                                            <h4 className="text-lg font-bold">{item.title}</h4>
                                            <div className="text-lg font-semibold text-right" style={{ color: visualSettings.accentColor }}>
                                                {item.quantity} x R$ {item.unitValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                <div className="text-sm text-gray-400">Total: R$ {item.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                            <p className="text-muted-foreground whitespace-pre-wrap text-sm">{item.description}</p>
                                            {item.features && (
                                                <div className="bg-gray-50 p-4 rounded-lg print:border">
                                                    <h5 className="text-xs font-semibold uppercase text-gray-400 mb-2">Destaques</h5>
                                                    <p className="text-sm">{item.features}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {option.observations && (
                                <div className="p-6 bg-gray-50 border-t border-gray-100 print:bg-transparent">
                                    <h5 className="text-xs font-semibold uppercase text-gray-400 mb-1">Observações da Opção</h5>
                                    <p className="text-sm text-muted-foreground italic">{option.observations}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Footer Observations */}
                {fullBudget.generalObservations && (
                    <div className="mt-12 bg-white p-8 rounded-xl border border-gray-100 shadow-md print:shadow-none">
                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Informações Adicionais</h3>
                        <p className="whitespace-pre-wrap text-muted-foreground text-sm">{fullBudget.generalObservations}</p>
                    </div>
                )}

                <footer className="mt-16 text-center text-muted-foreground border-t pt-8 print:mt-8">
                    {visualSettings.customFooter ? (
                        <p className="whitespace-pre-wrap text-sm">{visualSettings.customFooter}</p>
                    ) : (
                        <p className="text-sm font-bold">{visualSettings.companyName}</p>
                    )}
                    <p className="text-xs mt-4 opacity-50">Documento gerado eletronicamente.</p>
                </footer>
            </main>
        </div>
    );
}
