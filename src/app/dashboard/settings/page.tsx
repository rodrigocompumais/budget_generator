"use client";

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, Upload, X, ImageIcon } from 'lucide-react';
import { VisualSettings } from '@/lib/types';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

export default function SettingsPage() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [settings, setSettings] = useState<VisualSettings | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        async function loadSettings() {
            try {
                const response = await fetch('/api/settings');
                if (response.ok) {
                    const data = await response.json();
                    setSettings(data);
                }
            } catch (error) {
                console.error(error);
            }
        }
        loadSettings();
    }, []);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !settings) return;

        // Validar tipo de arquivo
        if (!file.type.startsWith('image/')) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Por favor, selecione uma imagem válida.' });
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const data = await response.json();
                setSettings({ ...settings, companyLogoUrl: data.url });
                toast({ title: 'Sucesso!', description: 'Logo enviada com sucesso.' });
            } else {
                toast({ variant: 'destructive', title: 'Erro', description: 'Erro ao fazer upload da logo.' });
            }
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Erro', description: 'Erro na conexão com o servidor.' });
        } finally {
            setIsUploading(false);
        }
    };

    const removeLogo = () => {
        if (settings) {
            setSettings({ ...settings, companyLogoUrl: '' });
        }
    };

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        if (!settings) return;

        setIsLoading(true);
        try {
            const response = await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });

            if (response.ok) {
                toast({ title: 'Configurações salvas!', description: 'Suas alterações foram aplicadas.' });
            } else {
                toast({ variant: 'destructive', title: 'Erro', description: 'Erro ao salvar configurações.' });
            }
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Erro', description: 'Erro inesperado.' });
        } finally {
            setIsLoading(false);
        }
    }

    if (!settings) return <div className="p-8 text-center text-muted-foreground">Carregando configurações...</div>;

    return (
        <div className="flex flex-col gap-6 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold tracking-tight">Configurações de Marca</h1>

            <form onSubmit={handleSave} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Identidade da Empresa</CardTitle>
                        <CardDescription>Configure como sua empresa aparece nos orçamentos públicos.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="companyName">Nome da Empresa</Label>
                                    <Input id="companyName" value={settings.companyName || ''} onChange={e => setSettings({ ...settings, companyName: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="footer">Rodapé Personalizado</Label>
                                    <Textarea id="footer" value={settings.customFooter || ''} onChange={e => setSettings({ ...settings, customFooter: e.target.value })} placeholder="Ex: Termos e condições, validade da proposta..." rows={4} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Logomarca da Empresa</Label>
                                <div
                                    className={`mt-1 border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center transition-all ${settings.companyLogoUrl ? 'bg-muted/50 border-primary/20' : 'border-muted-foreground/25 hover:border-primary/50 cursor-pointer'}`}
                                    onClick={() => !settings.companyLogoUrl && fileInputRef.current?.click()}
                                >
                                    {isUploading ? (
                                        <div className="flex flex-col items-center gap-2">
                                            <Loader2 className="h-10 w-10 animate-spin text-primary" />
                                            <span className="text-sm font-medium">Enviando...</span>
                                        </div>
                                    ) : settings.companyLogoUrl ? (
                                        <div className="relative group text-center">
                                            <img
                                                src={settings.companyLogoUrl}
                                                alt="Preview Logo"
                                                className="max-h-32 rounded object-contain mx-auto"
                                            />
                                            <div className="mt-4 flex gap-2 justify-center">
                                                <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                                                    Alterar
                                                </Button>
                                                <Button type="button" variant="destructive" size="sm" onClick={removeLogo}>
                                                    Remover
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center">
                                            <div className="bg-primary/10 p-3 rounded-full w-fit mx-auto mb-3">
                                                <Upload className="h-6 w-6 text-primary" />
                                            </div>
                                            <p className="text-sm font-medium">Clique para fazer upload</p>
                                            <p className="text-xs text-muted-foreground mt-1">PNG, SVG ou JPG (max. 2MB)</p>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleFileUpload}
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Cores e QR Code</CardTitle>
                        <CardDescription>Personalize o visual e funcionalidades extras dos orçamentos.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="primaryColor">Cor Primária</Label>
                                <div className="flex gap-2">
                                    <Input id="primaryColor" type="color" className="p-1 h-10 w-14" value={settings.primaryColor} onChange={e => setSettings({ ...settings, primaryColor: e.target.value })} />
                                    <Input value={settings.primaryColor} onChange={e => setSettings({ ...settings, primaryColor: e.target.value })} className="flex-1" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="accentColor">Cor de Destaque</Label>
                                <div className="flex gap-2">
                                    <Input id="accentColor" type="color" className="p-1 h-10 w-14" value={settings.accentColor} onChange={e => setSettings({ ...settings, accentColor: e.target.value })} />
                                    <Input value={settings.accentColor} onChange={e => setSettings({ ...settings, accentColor: e.target.value })} className="flex-1" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="bgColor">Cor de Fundo</Label>
                                <div className="flex gap-2">
                                    <Input id="bgColor" type="color" className="p-1 h-10 w-14" value={settings.backgroundColor} onChange={e => setSettings({ ...settings, backgroundColor: e.target.value })} />
                                    <Input value={settings.backgroundColor} onChange={e => setSettings({ ...settings, backgroundColor: e.target.value })} className="flex-1" />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between border-t pt-4">
                            <div className="space-y-0.5">
                                <Label>Exibir QR Code na Proposta</Label>
                                <p className="text-sm text-muted-foreground">Permite que o cliente acesse o link original via celular.</p>
                            </div>
                            <Switch checked={settings.showQrCode} onCheckedChange={checked => setSettings({ ...settings, showQrCode: checked })} />
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button type="submit" disabled={isLoading || isUploading} size="lg">
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <Save className="h-4 w-4 mr-2" /> Salvar Alterações
                    </Button>
                </div>
            </form>
        </div>
    );
}
