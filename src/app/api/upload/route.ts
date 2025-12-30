import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { randomBytes } from 'crypto';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'Nenhum arquivo enviado.' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Gerar nome único para o arquivo
        const fileExtension = file.name.split('.').pop();
        const fileName = `${randomBytes(8).toString('hex')}.${fileExtension}`;

        // Caminho absoluto para a pasta public/uploads
        const path = join(process.cwd(), 'public', 'uploads', fileName);

        await writeFile(path, buffer);

        // Retornar a URL relativa para ser acessada pelo navegador
        const url = `/uploads/${fileName}`;

        return NextResponse.json({ url });
    } catch (error) {
        console.error('Error uploading file:', error);
        return NextResponse.json({ error: 'Erro ao fazer upload do arquivo.' }, { status: 500 });
    }
}
