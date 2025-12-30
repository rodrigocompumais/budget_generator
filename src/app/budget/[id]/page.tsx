import { getBudgetById } from '@/lib/budget-service';
import { getVisualSettings } from '@/lib/visual-service';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Mail, Phone, Building2, User, FileText, ExternalLink, QrCode as QrIcon, CheckCircle2, ChevronRight, Briefcase, MessageCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import db from '@/lib/db';
import { Card, CardContent } from '@/components/ui/card';
import { PrintButton } from '@/components/print-button';

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

    const globalSettings = await getVisualSettings(row.user_id);

    // Priority: Per-Budget Settings > Global Settings > Defaults
    const theme = {
        primaryColor: fullBudget.primaryColor || globalSettings?.primaryColor || '#004691',
        backgroundColor: fullBudget.backgroundColor || globalSettings?.backgroundColor || '#ffffff',
        accentColor: fullBudget.accentColor || globalSettings?.accentColor || '#3b82f6',
        fontFamily: globalSettings?.fontFamily || 'Inter',
        companyName: globalSettings?.companyName || 'CompuMais Informática',
        companyLogoUrl: globalSettings?.companyLogoUrl,
        showQrCode: globalSettings?.showQrCode ?? true,
        customFooter: globalSettings?.customFooter
    };

    const proposalUrl = row.qr_code_link || row.public_link || `https://budget-generator.local/budget/${id}`;
    const proposalQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(proposalUrl)}`;

    return (
        <div className="min-h-screen flex bg-white print:bg-white" style={{ fontFamily: theme.fontFamily, backgroundColor: theme.backgroundColor }}>
            {/* FLOATING ACTION PREVIEW */}
            <div className="fixed top-6 right-6 z-50 print:hidden">
                <PrintButton />
            </div>

            {/* LEFT SIDEBAR (THE "NORTH" STRUCTURE) */}
            <aside className="w-80 min-h-screen bg-[#F0F5FA] p-12 flex flex-col justify-between border-r border-slate-100 print:w-64 print:p-8 print:bg-[#F0F5FA] sticky top-0 h-screen overflow-y-auto">
                <div className="space-y-16">
                    {/* Brand Logo & Identity */}
                    <div className="space-y-6 text-center lg:text-left">
                        {theme.companyLogoUrl ? (
                            <img src={theme.companyLogoUrl} alt="Logo" className="max-h-32 w-auto mx-auto lg:mx-0 object-contain" />
                        ) : (
                            <div className="h-16 w-16 rounded-2xl mx-auto lg:mx-0 flex items-center justify-center text-white font-black text-xl shadow-xl shadow-blue-500/20" style={{ backgroundColor: theme.primaryColor }}>
                                {theme.companyName?.charAt(0)}
                            </div>
                        )}
                        <div>
                            <h2 className="text-xl font-black uppercase tracking-widest leading-tight" style={{ color: theme.primaryColor }}>{theme.companyName}</h2>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2">Tecnologia & Inovação</p>
                        </div>
                    </div>

                    {/* Meta Data */}
                    <div className="space-y-10">
                        <div className="space-y-3">
                            <h4 className="text-[10px] font-black tracking-[0.3em] uppercase text-slate-400 flex items-center gap-3">
                                <User className="h-3 w-3" /> Cliente
                            </h4>
                            <div className="space-y-1">
                                <p className="text-xl font-bold text-slate-800 leading-tight">{fullBudget.client.name}</p>
                                {fullBudget.client.company && <p className="text-sm font-bold text-slate-500 uppercase tracking-tight">{fullBudget.client.company}</p>}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h4 className="text-[10px] font-black tracking-[0.3em] uppercase text-slate-400 flex items-center gap-3">
                                <Briefcase className="h-3 w-3" /> Responsável
                            </h4>
                            <p className="text-lg font-bold text-slate-800">{fullBudget.responsible || theme.companyName}</p>
                        </div>

                        {/* Recurrence Summary (Global) */}
                        {(fullBudget.options.some(opt => (opt.totalMensal || 0) > 0 || (opt.totalAnual || 0) > 0)) && (
                            <div className="space-y-4 pt-6 border-t border-slate-200">
                                <h4 className="text-[10px] font-black tracking-[0.3em] uppercase text-slate-400">Resumo de Recorrência</h4>
                                <div className="space-y-3">
                                    {fullBudget.options.some(opt => (opt.totalMensal || 0) > 0) && (
                                        <div>
                                            <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Total Mensal Máx.</p>
                                            <p className="text-xl font-black text-slate-800 tabular-nums">R$ {Math.max(...fullBudget.options.map(o => o.totalMensal || 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                                        </div>
                                    )}
                                    {fullBudget.options.some(opt => (opt.totalAnual || 0) > 0) && (
                                        <div>
                                            <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Total Anual Máx.</p>
                                            <p className="text-xl font-black text-slate-800 tabular-nums">R$ {Math.max(...fullBudget.options.map(o => o.totalAnual || 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {theme.showQrCode && (
                            <div className="space-y-4 pt-6 border-t border-slate-200">
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Acesse a Proposta Digital</p>
                                <div className="bg-white p-3 rounded-2xl inline-block shadow-sm">
                                    <img src={proposalQrUrl} alt="QR Access" className="w-24 h-24" />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Contact Area */}
                <div className="space-y-4 pt-10 border-t border-slate-200">
                    <div className="flex items-center gap-3 text-[#5ABF60] text-sm font-black">
                        <MessageCircle size={18} fill="#5ABF60" color="white" /> (34) 3351-1861
                    </div>
                    <div className="flex items-center gap-3 text-slate-400 text-sm font-bold">
                        <Phone size={18} /> (34) 98863-1861
                    </div>
                </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 relative p-12 lg:p-24 print:p-10 overflow-x-hidden">
                {/* WATERMARK */}
                {theme.companyLogoUrl && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.04] p-24">
                        <img src={theme.companyLogoUrl} alt="Watermark" className="max-w-[80%] max-h-[80%] object-contain" />
                    </div>
                )}

                <div className="relative z-10 max-w-5xl mx-auto space-y-20">
                    {/* DOC HEADER */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-100 mb-2">
                                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: theme.accentColor }}></span>
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Proposta nº {fullBudget.budgetNumber}</span>
                            </div>
                            <div className="space-y-1">
                                <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-[0.9] tracking-tighter uppercase italic">
                                    Orçamento
                                </h1>
                                <p className="text-2xl md:text-3xl font-bold text-slate-500 tracking-tight">
                                    {fullBudget.title}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Emissão oficial em</p>
                            <p className="text-lg font-black text-slate-900">{format(new Date(fullBudget.issueDate), "dd/MM/yyyy")}</p>
                        </div>
                    </div>

                    {/* BUDGET CONTENT */}
                    <div className="space-y-24">
                        {fullBudget.options.map((option, idx) => (
                            <section key={option.id} className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
                                {/* Option Divider/Title */}
                                <div className="flex items-center gap-6">
                                    <div className="bg-slate-900 h-10 w-10 rounded-xl flex items-center justify-center text-white font-black italic shadow-lg shadow-slate-900/20" style={{ backgroundColor: theme.primaryColor }}>
                                        {idx + 1}
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight italic">{option.title}</h3>
                                    <div className="h-px flex-1 bg-slate-100"></div>
                                    <div className="text-right flex items-end gap-6">
                                        {(option.totalMensal || 0) > 0 && (
                                            <div>
                                                <p className="text-[7px] font-black uppercase tracking-widest text-slate-400">Total Mensal</p>
                                                <div className="text-base font-black text-slate-600 tabular-nums leading-none">R$ {option.totalMensal?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                                            </div>
                                        )}
                                        {(option.totalAnual || 0) > 0 && (
                                            <div>
                                                <p className="text-[7px] font-black uppercase tracking-widest text-slate-400">Total Anual</p>
                                                <div className="text-base font-black text-slate-600 tabular-nums leading-none">R$ {option.totalAnual?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Investimento Total</p>
                                            <div className="text-2xl font-black text-slate-900 tabular-nums leading-none">R$ {option.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* PREMIUM CARDS FOR ITEMS */}
                                <div className="space-y-8">
                                    {option.items.map((item, itemIdx) => (
                                        <Card key={item.id} className="border-none bg-white shadow-xl shadow-slate-200/40 rounded-[2.5rem] overflow-hidden group/item ring-1 ring-slate-100 hover:ring-2 hover:ring-slate-200 transition-all duration-500">
                                            <CardContent className="p-0">
                                                <div className="grid grid-cols-1 md:grid-cols-12 items-stretch">
                                                    {/* Specs Content */}
                                                    <div className="md:col-span-8 p-10 lg:p-12 space-y-8 bg-gradient-to-br from-white to-slate-50/30">
                                                        <div className="space-y-3">
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-[10px] font-black text-slate-300">0{itemIdx + 1}</span>
                                                                <h4 className="text-2xl font-black text-slate-900 group-hover/item:text-slate-700 transition-colors uppercase tracking-tight italic">{item.title}</h4>
                                                            </div>
                                                            <p className="text-slate-500 font-medium leading-relaxed max-w-2xl">{item.description}</p>
                                                        </div>

                                                        {item.features && (
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-12 pt-4">
                                                                {item.features.split('\n').filter(f => f.trim()).map((feat, fIdx) => (
                                                                    <div key={fIdx} className="flex items-center gap-3 group/feat">
                                                                        <div className="h-1.5 w-1.5 rounded-full bg-slate-200 group-hover/feat:bg-blue-500 transition-colors" style={{ backgroundColor: theme.accentColor }}></div>
                                                                        <span className="text-sm font-bold text-slate-600 italic">{feat}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Pricing & CTA */}
                                                    <div className="md:col-span-4 bg-slate-50/80 p-10 lg:p-12 border-l border-slate-100/50 flex flex-col justify-between items-center md:items-end gap-10">
                                                        <div className="text-center md:text-right space-y-2">
                                                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Investimento Estimado</p>
                                                            {(item.prices || []).map((price) => (
                                                                <div key={price.id} className="flex flex-col items-center md:items-end">
                                                                    <div className="text-3xl font-black text-slate-900 tabular-nums">
                                                                        R$ {(price.value * item.quantity).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                                    </div>
                                                                    <p className="text-[11px] font-bold text-slate-400 italic">
                                                                        {price.billingCycle === 'mensal' ? '/ Mês' :
                                                                            price.billingCycle === 'anual' ? '/ Ano' :
                                                                                'Valor Único'}
                                                                    </p>
                                                                </div>
                                                            ))}
                                                        </div>

                                                        {item.presentationLink && (
                                                            <div className="w-full space-y-4">
                                                                <Button asChild className="w-full h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/10 hover:scale-[1.02] transition-transform print:hidden" style={{ backgroundColor: theme.accentColor }}>
                                                                    <a href={item.presentationLink} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3">
                                                                        Ver Detalhes <ExternalLink size={14} />
                                                                    </a>
                                                                </Button>

                                                                <div className="hidden print:flex flex-col items-center gap-2">
                                                                    <img
                                                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(item.presentationLink)}`}
                                                                        alt="Details QR"
                                                                        className="w-16 h-16 border-2 border-white shadow-sm p-1 rounded-xl"
                                                                    />
                                                                    <span className="text-[7px] font-black text-slate-300 uppercase tracking-widest">Escaneie para mais info</span>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </section>
                        ))}
                    </div>

                    {/* GENERAL NOTES */}
                    {fullBudget.generalObservations && (
                        <Card className="bg-slate-900 rounded-[3rem] p-12 lg:p-16 text-white border-none shadow-3xl shadow-slate-900/30 overflow-hidden relative" style={{ backgroundColor: theme.primaryColor }}>
                            <div className="absolute -top-10 -right-10 opacity-5 rotate-12">
                                <FileText size={240} />
                            </div>
                            <div className="relative z-10 space-y-8">
                                <h3 className="text-xs font-black uppercase tracking-[0.4em] text-white/50 flex items-center gap-4">
                                    <span className="h-[2px] w-12 bg-white/20"></span> Condições Gerais & Validade
                                </h3>
                                <div className="text-lg text-white/80 font-medium leading-relaxed whitespace-pre-wrap italic">
                                    {fullBudget.generalObservations}
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* FOOTER */}
                    <footer className="pt-20 pb-10 text-center space-y-6">
                        <div className="h-px bg-slate-100"></div>
                        <div className="flex flex-col items-center gap-3">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em]">{theme.companyName}</p>
                            <p className="text-[8px] font-black text-slate-200 uppercase tracking-[0.2em] italic">Proposta processada digitalmente &bull; Documento sem validade fiscal</p>
                        </div>
                    </footer>
                </div>
            </main>
        </div>
    );
}
