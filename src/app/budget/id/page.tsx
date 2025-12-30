import { getBudgetById } from '@/lib/budget-service';
import { getVisualSettings } from '@/lib/visual-service';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Mail, Phone, Building2, User, FileText, Calendar, ExternalLink, QrCode } from 'lucide-react';
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
        backgroundColor: settings?.backgroundColor || '#f8fafc',
        accentColor: settings?.accentColor || '#10b981',
        fontFamily: settings?.fontFamily || 'Inter',
        companyName: settings?.companyName || 'Proposta Comercial',
        companyLogoUrl: settings?.companyLogoUrl,
        showQrCode: settings?.showQrCode ?? true,
        customFooter: settings?.customFooter
    };

    // QR Code for the proposal itself
    const proposalUrl = row.qr_code_link || row.public_link || `https://budget-generator.local/budget/${id}`;
    const proposalQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(proposalUrl)}`;

    return (
        <div className="min-h-screen pb-12 print:pb-0" style={{ backgroundColor: visualSettings.backgroundColor, fontFamily: visualSettings.fontFamily }}>
            {/* Minimal Header */}
            <header className="bg-white border-b sticky top-0 z-50 shadow-sm print:relative print:shadow-none">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {visualSettings.companyLogoUrl ? (
                            <img src={visualSettings.companyLogoUrl} alt="Logo" className="h-8 object-contain" />
                        ) : (
                            <div className="h-8 w-8 rounded flex items-center justify-center text-white font-bold" style={{ backgroundColor: visualSettings.primaryColor }}>
                                {visualSettings.companyName?.charAt(0) || 'P'}
                            </div>
                        )}
                        <h1 className="text-sm font-bold truncate max-w-[200px]">{visualSettings.companyName}</h1>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground mr-6">
                        <span className="hidden sm:inline">Orçamento: <strong className="text-foreground">{fullBudget.budgetNumber}</strong></span>
                        <Button size="sm" variant="outline" className="h-8 print:hidden" onClick={() => window.print()}>
                            Imprimir / PDF
                        </Button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 pt-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* LEFT COLUMN: BUDGET CONTENT */}
                    <div className="lg:col-span-8 space-y-8">
                        {/* Title Section */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200/60 print:border-none print:shadow-none print:p-0">
                            <h2 className="text-4xl font-black tracking-tight mb-2 text-slate-900 border-l-8 pl-6" style={{ borderColor: visualSettings.primaryColor }}>
                                {fullBudget.title}
                            </h2>
                            <p className="text-slate-500 text-lg pl-8">
                                Proposta encaminhada para <span className="font-bold text-slate-700">{fullBudget.client.name}</span>
                            </p>
                        </div>

                        {/* Options Section */}
                        <div className="space-y-12">
                            {fullBudget.options.map((option, idx) => (
                                <section key={option.id} className="bg-white rounded-2xl shadow-md border border-slate-200/60 overflow-hidden print:shadow-none print:border-slate-100">
                                    <div className="px-8 py-6 text-white flex justify-between items-center bg-slate-900" style={{ backgroundColor: visualSettings.primaryColor }}>
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center font-bold">{idx + 1}</div>
                                            <h3 className="text-xl font-black uppercase tracking-tight">{option.title}</h3>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] uppercase font-bold opacity-70">Investimento Total</p>
                                            <div className="text-2xl font-black">R$ {option.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                                        </div>
                                    </div>

                                    <div className="divide-y divide-slate-100">
                                        {option.items.map((item) => (
                                            <div key={item.id} className="p-8 group hover:bg-slate-50/50 transition-colors">
                                                <div className="flex flex-col md:flex-row justify-between gap-6 mb-4">
                                                    <div className="flex-1">
                                                        <h4 className="text-xl font-bold text-slate-800 mb-2">{item.title}</h4>
                                                        <p className="text-slate-600 leading-relaxed text-sm mb-4">{item.description}</p>

                                                        {item.features && (
                                                            <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 print:bg-transparent">
                                                                <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3">Destaques & Especificações</h5>
                                                                <ul className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-6">
                                                                    {item.features.split('\n').filter(f => f.trim()).map((feat, fIdx) => (
                                                                        <li key={fIdx} className="text-sm flex items-start gap-2 text-slate-700">
                                                                            <span className="h-1.5 w-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: visualSettings.primaryColor }} />
                                                                            {feat}
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="flex flex-col items-center md:items-end gap-4 min-w-[200px]">
                                                        <div className="text-right">
                                                            <div className="text-sm text-slate-400 font-medium">
                                                                {item.quantity} x R$ {item.unitValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                            </div>
                                                            <div className="text-xl font-black text-slate-800" style={{ color: visualSettings.primaryColor }}>
                                                                R$ {item.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                            </div>
                                                        </div>

                                                        {item.presentationLink && (
                                                            <>
                                                                {/* SCREEN: Button */}
                                                                <Button asChild className="w-full print:hidden" style={{ backgroundColor: visualSettings.accentColor }}>
                                                                    <a href={item.presentationLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                                                                        <ExternalLink className="h-4 w-4" /> Ver Apresentação
                                                                    </a>
                                                                </Button>
                                                                {/* PRINT: QR Code */}
                                                                <div className="hidden print:flex flex-col items-center gap-1 border-2 border-slate-100 p-2 rounded-lg">
                                                                    <img
                                                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(item.presentationLink)}`}
                                                                        alt="QR Link"
                                                                        className="w-16 h-16"
                                                                    />
                                                                    <span className="text-[8px] font-bold text-slate-400 uppercase">Apresentação</span>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {option.observations && (
                                        <div className="p-6 bg-slate-50 border-t border-slate-100 print:bg-transparent">
                                            <p className="text-xs text-slate-500 italic flex gap-2">
                                                <span className="font-bold uppercase not-italic">Obs:</span> {option.observations}
                                            </p>
                                        </div>
                                    )}
                                </section>
                            ))}
                        </div>

                        {/* Additional Info Section */}
                        {fullBudget.generalObservations && (
                            <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200/60 print:shadow-none print:p-0">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                    <FileText className="h-4 w-4" /> Informações Adicionais & Termos
                                </h3>
                                <div className="prose prose-slate max-w-none text-slate-600 text-sm whitespace-pre-wrap leading-relaxed">
                                    {fullBudget.generalObservations}
                                </div>
                            </section>
                        )}
                    </div>

                    {/* RIGHT COLUMN: SIDEBAR */}
                    <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
                        {/* Proposal Card */}
                        <Card className="overflow-hidden border-none shadow-lg print:shadow-none print:border-2">
                            <div className="p-6 bg-slate-900 text-white" style={{ backgroundColor: visualSettings.primaryColor }}>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="bg-white/20 p-2 rounded-lg">
                                        <FileText className="h-6 w-6" />
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-bold uppercase opacity-60">Número</p>
                                        <p className="text-lg font-black font-mono tracking-tighter">{fullBudget.budgetNumber}</p>
                                    </div>
                                </div>
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-[10px] font-bold uppercase opacity-60">Emissão</p>
                                        <p className="text-xs font-bold">{format(new Date(fullBudget.issueDate), "dd/MM/yyyy", { locale: ptBR })}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-bold uppercase opacity-60">Status</p>
                                        <span className="text-[10px] font-black uppercase bg-white/20 px-2 py-0.5 rounded-full">{fullBudget.status}</span>
                                    </div>
                                </div>
                            </div>

                            <CardContent className="p-6 space-y-6">
                                {/* Client Info Header Small */}
                                <div>
                                    <h4 className="text-[10px] font-black tracking-widest uppercase text-slate-400 mb-4 flex items-center gap-2">
                                        <User className="h-3 w-3" /> Para o Cliente
                                    </h4>
                                    <p className="text-lg font-black text-slate-900 mb-2">{fullBudget.client.name}</p>
                                    <div className="space-y-2">
                                        {fullBudget.client.company && (
                                            <div className="flex items-center gap-3 text-slate-600 text-sm">
                                                <Building2 className="h-4 w-4 opacity-40" /> {fullBudget.client.company}
                                            </div>
                                        )}
                                        <div className="flex items-center gap-3 text-slate-600 text-sm">
                                            <Mail className="h-4 w-4 opacity-40" /> {fullBudget.client.email}
                                        </div>
                                        {fullBudget.client.phone && (
                                            <div className="flex items-center gap-3 text-slate-600 text-sm">
                                                <Phone className="h-4 w-4 opacity-40" /> {fullBudget.client.phone}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <hr className="border-slate-100" />

                                {/* QR CODE PROPOSAL */}
                                {visualSettings.showQrCode && (
                                    <div className="flex flex-col items-center bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                        <img src={proposalQrUrl} alt="Proposal QR" className="w-40 h-40 bg-white p-2 rounded-xl mb-3 shadow-sm" />
                                        <p className="text-[10px] font-black text-slate-900 uppercase tracking-tighter mb-1">Acesso Mobile</p>
                                        <p className="text-[9px] text-slate-500 text-center leading-tight">Escaneie para acessar esta proposta em tempo real pelo seu celular</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Contact Card */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm text-center">
                            <h4 className="text-[10px] font-black tracking-widest uppercase text-slate-400 mb-4">Emissor da Proposta</h4>
                            <p className="font-bold text-slate-800">{fullBudget.responsible || visualSettings.companyName}</p>
                            <p className="text-xs text-slate-500">{visualSettings.companyName}</p>
                        </div>
                    </aside>
                </div>

                {/* Footer Section */}
                <footer className="mt-24 text-center text-slate-400 border-t pt-12 pb-12 print:mt-12 print:pb-0">
                    <div className="max-w-2xl mx-auto space-y-6">
                        {visualSettings.customFooter ? (
                            <div className="text-sm prose prose-slate max-w-none text-slate-500 font-medium">
                                {visualSettings.customFooter}
                            </div>
                        ) : (
                            <p className="text-sm font-black text-slate-800 uppercase tracking-widest">{visualSettings.companyName}</p>
                        )}
                        <hr className="w-12 border-2 border-slate-200 mx-auto" style={{ borderColor: visualSettings.primaryColor }} />
                        <p className="text-[10px] uppercase font-bold tracking-widest opacity-50">Documento gerado eletronicamente &bull; &copy; {new Date().getFullYear()}</p>
                    </div>
                </footer>
            </main>
        </div>
    );
}
