import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AppLogo } from '@/components/app-logo';
import Image from 'next/image';
import Link from 'next/link';
import {
  FileText,
  Palette,
  Share2,
  Zap,
  ShieldCheck,
  QrCode,
} from 'lucide-react';

const features = [
  {
    icon: <FileText className="h-8 w-8 text-primary" />,
    title: 'Orçamentos Dinâmicos',
    description:
      'Crie, edite e gerencie orçamentos com uma estrutura flexível de produtos, serviços e opções.',
  },
  {
    icon: <Palette className="h-8 w-8 text-primary" />,
    title: 'Identidade Visual',
    description:
      'Personalize seus orçamentos com seu logo, cores e fontes para manter a identidade da sua marca.',
  },
  {
    icon: <Share2 className="h-8 w-8 text-primary" />,
    title: 'Exportação e Partilha',
    description:
      'Exporte para PDF com um clique e partilhe através de um link público com os seus clientes.',
  },
  {
    icon: <Zap className="h-8 w-8 text-primary" />,
    title: 'Links Rápidos',
    description:
      'Adicione links para WhatsApp, pagamentos e mais, facilitando a comunicação e conversão.',
  },
  {
    icon: <QrCode className="h-8 w-8 text-primary" />,
    title: 'QR Code Integrado',
    description:
      'Gere QR Codes automaticamente para acesso rápido ao orçamento online ou links de pagamento.',
  },
  {
    icon: <ShieldCheck className="h-8 w-8 text-primary" />,
    title: 'Segurança e Acesso',
    description:
      'Autenticação segura e controle de acesso para que cada usuário veja apenas seus próprios orçamentos.',
  },
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <AppLogo />
          <span className="text-xl font-bold text-primary">TechQuote Pro</span>
        </Link>
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/login">Entrar</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">Criar Conta</Link>
          </Button>
        </div>
      </header>

      <main className="flex-grow">
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-headline font-bold text-card-foreground leading-tight">
                Crie orçamentos profissionais em minutos.
              </h1>
              <p className="text-lg text-muted-foreground">
                Substitua documentos manuais por orçamentos modernos,
                elegantes e dinâmicos. A ferramenta ideal para empresas de
                tecnologia e serviços.
              </p>
              <div className="flex gap-4">
                <Button size="lg" asChild>
                  <Link href="/signup">Comece agora</Link>
                </Button>
                <Button size="lg" variant="outline">
                  Saber mais
                </Button>
              </div>
            </div>
            <div>
              <Image
                src="https://picsum.photos/seed/1/600/400"
                alt="Orçamento Profissional"
                width={600}
                height={400}
                className="rounded-lg shadow-xl"
                data-ai-hint="professional document"
              />
            </div>
          </div>
        </section>

        <section id="features" className="bg-card py-20 md:py-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl md:text-4xl font-headline font-bold">
                Funcionalidades Poderosas
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Tudo o que precisa para agilizar o seu processo comercial e
                impressionar os seus clientes.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="bg-background p-6 rounded-lg">
                  {feature.icon}
                  <h3 className="text-xl font-bold mt-4 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} TechQuote Pro. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
