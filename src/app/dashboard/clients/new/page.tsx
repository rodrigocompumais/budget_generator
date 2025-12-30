"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { createClientAction } from '@/app/actions/client-actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const formSchema = z.object({
    name: z.string().min(2, { message: 'O nome deve ter pelo menos 2 caracteres.' }),
    email: z.string().email({ message: 'Email inválido.' }),
    company: z.string().optional(),
    phone: z.string().optional(),
});

export default function NewClientPage() {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { toast } = useToast();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            email: '',
            company: '',
            phone: '',
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);
        try {
            const result = await createClientAction(values);
            if (result.success) {
                toast({
                    title: 'Cliente criado!',
                    description: 'O cliente foi adicionado com sucesso.',
                });
                router.push('/dashboard/clients');
            } else {
                toast({
                    variant: 'destructive',
                    title: 'Erro',
                    description: result.error || 'Ocorreu um erro ao criar o cliente.',
                });
            }
        } catch (error) {
            console.error(error);
            toast({
                variant: 'destructive',
                title: 'Erro',
                description: 'Ocorreu um erro inesperado.',
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="flex flex-col gap-6 max-w-2xl mx-auto">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/dashboard/clients">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <h1 className="text-3xl font-bold tracking-tight">Novo Cliente</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Informações do Cliente</CardTitle>
                    <CardDescription>Insira os dados básicos para o novo cadastro.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nome Completo *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ex: João da Silva" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="joao@email.com" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="phone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Telefone</FormLabel>
                                            <FormControl>
                                                <Input placeholder="(00) 00000-0000" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <FormField
                                control={form.control}
                                name="company"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Empresa</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Nome da empresa (opcional)" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="flex gap-4 justify-end pt-4">
                                <Button variant="outline" type="button" asChild disabled={isLoading}>
                                    <Link href="/dashboard/clients">Cancelar</Link>
                                </Button>
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Salvar Cliente
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
