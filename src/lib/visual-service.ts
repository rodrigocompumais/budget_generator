import db from './db';
import { VisualSettings } from './types';

/**
 * Obter configurações visuais de um usuário
 */
export async function getVisualSettings(userId: string): Promise<VisualSettings | null> {
    try {
        const row = db.prepare(`
            SELECT * FROM visual_settings WHERE user_id = ?
        `).get(userId) as any;

        if (!row) return null;

        return {
            userId: row.user_id,
            companyLogoUrl: row.company_logo_url,
            companyName: row.company_name,
            primaryColor: row.primary_color,
            backgroundColor: row.background_color,
            accentColor: row.accent_color,
            fontFamily: row.font_family,
            customFooter: row.custom_footer,
            showQrCode: Boolean(row.show_qr_code)
        };
    } catch (error) {
        console.error('Error getting visual settings:', error);
        return null;
    }
}

/**
 * Atualizar ou criar configurações visuais
 */
export async function saveVisualSettings(settings: VisualSettings): Promise<boolean> {
    try {
        const existing = db.prepare('SELECT user_id FROM visual_settings WHERE user_id = ?').get(settings.userId);

        if (existing) {
            const result = db.prepare(`
                UPDATE visual_settings
                SET company_logo_url = ?, company_name = ?, primary_color = ?, 
                    background_color = ?, accent_color = ?, font_family = ?, 
                    custom_footer = ?, show_qr_code = ?
                WHERE user_id = ?
            `).run(
                settings.companyLogoUrl || null,
                settings.companyName || null,
                settings.primaryColor,
                settings.backgroundColor,
                settings.accentColor,
                settings.fontFamily,
                settings.customFooter || null,
                settings.showQrCode ? 1 : 0,
                settings.userId
            );
            return result.changes > 0;
        } else {
            const result = db.prepare(`
                INSERT INTO visual_settings (
                    user_id, company_logo_url, company_name, primary_color, 
                    background_color, accent_color, font_family, custom_footer, show_qr_code
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).run(
                settings.userId,
                settings.companyLogoUrl || null,
                settings.companyName || null,
                settings.primaryColor,
                settings.backgroundColor,
                settings.accentColor,
                settings.fontFamily,
                settings.customFooter || null,
                settings.showQrCode ? 1 : 0
            );
            return result.changes > 0;
        }
    } catch (error) {
        console.error('Error saving visual settings:', error);
        return false;
    }
}
