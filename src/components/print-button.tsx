"use client";

import { Button } from "@/components/ui/button";

export function PrintButton() {
    return (
        <Button
            size="sm"
            variant="outline"
            className="h-7 text-[10px] font-bold px-3 print:hidden uppercase tracking-widest"
            onClick={() => window.print()}
        >
            IMPRIMIR PDF
        </Button>
    );
}
