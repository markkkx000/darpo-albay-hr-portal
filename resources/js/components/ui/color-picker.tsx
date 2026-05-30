import * as React from 'react';
import { Pipette } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Helper to convert hex to RGB
function hexToRgb(hex: string) {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    const fullHex = hex.replace(shorthandRegex, (_, r, g, b) => r + r + g + g + b + b);
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 59, g: 130, b: 246 }; // fallback #3b82f6
}

// Helper to convert RGB to hex
function rgbToHex(r: number, g: number, b: number): string {
    const clamp = (val: number) => Math.max(0, Math.min(255, Math.round(val)));
    const toHex = (c: number) => {
        const hex = clamp(c).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Helper to convert RGB to HSL
function rgbToHsl(r: number, g: number, b: number) {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100)
    };
}

// Helper to convert HSL to RGB
function hslToRgb(h: number, s: number, l: number) {
    h /= 360;
    s /= 100;
    l /= 100;
    let r = l;
    let g = l;
    let b = l;

    if (s !== 0) {
        const hue2rgb = (p: number, q: number, t: number) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
}

const PRESET_COLORS = [
    // Row 1: Brand & Main Accents
    '#22c55e', '#38e54d', '#16a34a', '#86efac', '#eab308', '#facc15',
    // Row 2: Dignified Tones
    '#3b82f6', '#0ea5e9', '#6366f1', '#a855f7', '#ec4899', '#f43f5e',
    // Row 3: Earth & Nature
    '#059669', '#047857', '#0f766e', '#115e59', '#f97316', '#ea580c',
    // Row 4: Slate & Dark Accents
    '#64748b', '#475569', '#334155', '#1e293b', '#000000', '#ffffff'
];

interface ColorPickerProps {
    value: string;
    onChange: (color: string) => void;
    className?: string;
}

export function ColorPicker({ value, onChange, className }: ColorPickerProps) {
    const [open, setOpen] = React.useState(false);
    
    // Derived local state synchronized with value prop
    const [hexInput, setHexInput] = React.useState(value);
    const [hsl, setHsl] = React.useState(() => {
        const { r, g, b } = hexToRgb(value);
        return rgbToHsl(r, g, b);
    });
    const [rgb, setRgb] = React.useState(() => hexToRgb(value));

    // Keep state in sync with external value change
    React.useEffect(() => {
        setHexInput(value);
        const nextRgb = hexToRgb(value);
        setRgb(nextRgb);
        setHsl(rgbToHsl(nextRgb.r, nextRgb.g, nextRgb.b));
    }, [value]);

    const handleHslChange = (h: number, s: number, l: number) => {
        const newHsl = { h, s, l };
        setHsl(newHsl);
        const newRgb = hslToRgb(h, s, l);
        setRgb(newRgb);
        const newHex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
        setHexInput(newHex);
        onChange(newHex);
    };

    const handleRgbChange = (r: number, g: number, b: number) => {
        const newRgb = { r, g, b };
        setRgb(newRgb);
        setHsl(rgbToHsl(r, g, b));
        const newHex = rgbToHex(r, g, b);
        setHexInput(newHex);
        onChange(newHex);
    };

    const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setHexInput(val);
        
        // Match standard 3 or 6 hex digit formats with leading #
        if (/^#[0-9A-Fa-f]{6}$|^#[0-9A-Fa-f]{3}$/.test(val)) {
            const nextRgb = hexToRgb(val);
            setRgb(nextRgb);
            setHsl(rgbToHsl(nextRgb.r, nextRgb.g, nextRgb.b));
            onChange(val);
        }
    };

    const handlePresetSelect = (preset: string) => {
        onChange(preset);
    };

    return (
        <div className={cn("flex items-center space-x-2 w-full", className)}>
            <Popover open={open} onOpenChange={setOpen} modal={true}>
                <PopoverTrigger asChild>
                    <button
                        type="button"
                        className="relative w-12 h-9 shrink-0 group/color rounded-2xl border border-border shadow-xs transition-transform duration-200 hover:scale-105 active:scale-95 flex items-center justify-center overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-1"
                        style={{ backgroundColor: value }}
                    >
                        <Pipette className="h-4 w-4 text-white opacity-0 group-hover/color:opacity-100 transition-opacity drop-shadow-sm pointer-events-none" />
                    </button>
                </PopoverTrigger>
                <PopoverContent 
                    align="start" 
                    sideOffset={8}
                    collisionPadding={16}
                    className="w-80 p-0 matte-card elev-3 border border-border-2 rounded-2xl shadow-2xl focus:outline-none animate-in fade-in-50 zoom-in-95 duration-200"
                >
                  <div 
                      className="p-4 space-y-4 overflow-y-auto"
                      style={{ maxHeight: 'calc(var(--radix-popover-content-available-height, 85vh) - 2px)' }}
                  >
                    {/* Header preview */}
                    <div className="flex items-center justify-between border-b border-border-1 pb-3">
                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Color Picker</h4>
                            <span className="text-[11px] font-mono font-bold text-foreground">{value.toUpperCase()}</span>
                        </div>
                        <div 
                            className="w-14 h-8 rounded-xl border border-border shadow-inner"
                            style={{ backgroundColor: value }}
                        />
                    </div>

                    {/* Preset Swatches Grid */}
                    <div className="space-y-1.5">
                        <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Preset Colors</Label>
                        <div className="grid grid-cols-6 gap-2">
                            {PRESET_COLORS.map((color) => (
                                <button
                                    key={color}
                                    type="button"
                                    onClick={() => handlePresetSelect(color)}
                                    className={cn(
                                        "w-full aspect-square rounded-full border border-black/5 dark:border-white/10 shadow-xs cursor-pointer transition-transform duration-100 hover:scale-110 active:scale-90 relative flex items-center justify-center",
                                        value.toLowerCase() === color.toLowerCase() && "ring-2 ring-primary ring-offset-2 dark:ring-offset-neutral-900 scale-105"
                                    )}
                                    style={{ backgroundColor: color }}
                                    title={color}
                                />
                            ))}
                        </div>
                    </div>

                    {/* HSL Sliders */}
                    <div className="space-y-3 pt-1">
                        {/* Hue */}
                        <div className="space-y-1">
                            <div className="flex justify-between text-[10px] font-bold uppercase text-muted-foreground font-mono">
                                <span>Hue</span>
                                <span>{hsl.h}°</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="360"
                                value={hsl.h}
                                onChange={(e) => handleHslChange(Number(e.target.value), hsl.s, hsl.l)}
                                className="w-full h-2 rounded-full cursor-pointer appearance-none outline-none focus:outline-none accent-primary"
                                style={{
                                    background: 'linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)'
                                }}
                            />
                        </div>

                        {/* Saturation */}
                        <div className="space-y-1">
                            <div className="flex justify-between text-[10px] font-bold uppercase text-muted-foreground font-mono">
                                <span>Saturation</span>
                                <span>{hsl.s}%</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={hsl.s}
                                onChange={(e) => handleHslChange(hsl.h, Number(e.target.value), hsl.l)}
                                className="w-full h-2 rounded-full cursor-pointer appearance-none outline-none focus:outline-none accent-primary"
                                style={{
                                    background: `linear-gradient(to right, hsl(${hsl.h}, 0%, 50%), hsl(${hsl.h}, 100%, 50%))`
                                }}
                            />
                        </div>

                        {/* Lightness */}
                        <div className="space-y-1">
                            <div className="flex justify-between text-[10px] font-bold uppercase text-muted-foreground font-mono">
                                <span>Lightness</span>
                                <span>{hsl.l}%</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={hsl.l}
                                onChange={(e) => handleHslChange(hsl.h, hsl.s, Number(e.target.value))}
                                className="w-full h-2 rounded-full cursor-pointer appearance-none outline-none focus:outline-none accent-primary"
                                style={{
                                    background: `linear-gradient(to right, #000000, hsl(${hsl.h}, ${hsl.s}%, 50%), #ffffff)`
                                }}
                            />
                        </div>
                    </div>

                    {/* Numeric Sync Inputs */}
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border-1">
                        <div className="space-y-1">
                            <Label className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground text-center block">RGB</Label>
                            <div className="flex gap-0.5">
                                <input
                                    type="number"
                                    min="0"
                                    max="255"
                                    value={rgb.r}
                                    onChange={(e) => handleRgbChange(Number(e.target.value), rgb.g, rgb.b)}
                                    className="w-full text-center text-[10px] font-mono bg-surface-2 border border-border-2 rounded-lg py-1 px-0.5 focus:outline-none focus:ring-1 focus:ring-primary/40"
                                    title="Red"
                                />
                                <input
                                    type="number"
                                    min="0"
                                    max="255"
                                    value={rgb.g}
                                    onChange={(e) => handleRgbChange(rgb.r, Number(e.target.value), rgb.b)}
                                    className="w-full text-center text-[10px] font-mono bg-surface-2 border border-border-2 rounded-lg py-1 px-0.5 focus:outline-none focus:ring-1 focus:ring-primary/40"
                                    title="Green"
                                />
                                <input
                                    type="number"
                                    min="0"
                                    max="255"
                                    value={rgb.b}
                                    onChange={(e) => handleRgbChange(rgb.r, rgb.g, Number(e.target.value))}
                                    className="w-full text-center text-[10px] font-mono bg-surface-2 border border-border-2 rounded-lg py-1 px-0.5 focus:outline-none focus:ring-1 focus:ring-primary/40"
                                    title="Blue"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <Label className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground text-center block">HSL</Label>
                            <div className="flex gap-0.5">
                                <input
                                    type="number"
                                    min="0"
                                    max="360"
                                    value={hsl.h}
                                    onChange={(e) => handleHslChange(Number(e.target.value), hsl.s, hsl.l)}
                                    className="w-full text-center text-[10px] font-mono bg-surface-2 border border-border-2 rounded-lg py-1 px-0.5 focus:outline-none focus:ring-1 focus:ring-primary/40"
                                    title="Hue"
                                />
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={hsl.s}
                                    onChange={(e) => handleHslChange(hsl.h, Number(e.target.value), hsl.l)}
                                    className="w-full text-center text-[10px] font-mono bg-surface-2 border border-border-2 rounded-lg py-1 px-0.5 focus:outline-none focus:ring-1 focus:ring-primary/40"
                                    title="Saturation"
                                />
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={hsl.l}
                                    onChange={(e) => handleHslChange(hsl.h, hsl.s, Number(e.target.value))}
                                    className="w-full text-center text-[10px] font-mono bg-surface-2 border border-border-2 rounded-lg py-1 px-0.5 focus:outline-none focus:ring-1 focus:ring-primary/40"
                                    title="Lightness"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <Label className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground text-center block">HEX</Label>
                            <input
                                type="text"
                                value={hexInput}
                                onChange={handleHexInputChange}
                                className="w-full text-center text-[10px] font-mono bg-surface-2 border border-border-2 rounded-lg py-1 focus:outline-none focus:ring-1 focus:ring-primary/40"
                                title="HEX"
                            />
                        </div>
                    </div>

                    {/* OK / Confirm button */}
                    <div className="pt-2">
                        <Button 
                            type="button" 
                            onClick={() => setOpen(false)}
                            className="btn-specular w-full font-bold text-xs py-2 shadow-lg"
                        >
                            Confirm Selection
                        </Button>
                    </div>
                  </div>
                </PopoverContent>
            </Popover>
            <Input 
                value={value.toUpperCase()} 
                onChange={(e) => {
                    const val = e.target.value;
                    if (/^#[0-9A-Fa-f]{6}$|^#[0-9A-Fa-f]{3}$/.test(val)) {
                        onChange(val);
                    } else if (val.startsWith('#') || val.length <= 7) {
                        // Allow typing with fallback
                        onChange(val);
                    }
                }} 
                className="flex-1 font-mono uppercase text-xs tracking-wider" 
            />
        </div>
    );
}
