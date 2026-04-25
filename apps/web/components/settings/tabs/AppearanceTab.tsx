'use client';
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const ACCENT_COLORS = [
  { name: 'Purple', value: '#534AB7', label: 'Default' },
  { name: 'Blue', value: '#3B82F6', label: '' },
  { name: 'Teal', value: '#1D9E75', label: '' },
  { name: 'Rose', value: '#F43F5E', label: '' },
  { name: 'Amber', value: '#EF9F27', label: '' },
  { name: 'Green', value: '#22C55E', label: '' },
];

const EDITOR_THEMES = ['VS Dark', 'VS Light', 'Monokai', 'GitHub Dark', 'Dracula'];

export function AppearanceTab() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [accent, setAccent] = useState(() =>
    typeof window !== 'undefined' ? localStorage.getItem('sa-accent') ?? '#534AB7' : '#534AB7'
  );
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>(() => {
    if (typeof window === 'undefined') return 'medium';
    const stored = localStorage.getItem('sa-font-size');
    if (stored === 'small' || stored === 'large') return stored;
    return 'medium';
  });
  const [editorTheme, setEditorTheme] = useState(() =>
    typeof window !== 'undefined' ? localStorage.getItem('sa-editor-theme') ?? 'VS Dark' : 'VS Dark'
  );
  const [editorFontSize, setEditorFontSize] = useState(() =>
    typeof window !== 'undefined' ? Number(localStorage.getItem('sa-editor-font-size') ?? 14) : 14
  );
  const [tabSize, setTabSize] = useState<2 | 4>(() =>
    typeof window !== 'undefined' ? (Number(localStorage.getItem('sa-tab-size') ?? 2) as 2 | 4) : 2
  );

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    document.documentElement.style.setProperty('--accent-color', accent);
    localStorage.setItem('sa-accent', accent);
  }, [accent]);

  useEffect(() => {
    localStorage.setItem('sa-font-size', fontSize);
    const map = { small: '14px', medium: '16px', large: '18px' };
    document.documentElement.style.setProperty('--app-font-size', map[fontSize]);
  }, [fontSize]);

  useEffect(() => { localStorage.setItem('sa-editor-theme', editorTheme); }, [editorTheme]);
  useEffect(() => { localStorage.setItem('sa-editor-font-size', String(editorFontSize)); }, [editorFontSize]);
  useEffect(() => { localStorage.setItem('sa-tab-size', String(tabSize)); }, [tabSize]);

  const themeOptions = [
    { value: 'light', label: 'Light', preview: 'bg-white border' },
    { value: 'dark', label: 'Dark', preview: 'bg-zinc-900 border-zinc-700' },
    { value: 'system', label: 'System', preview: 'bg-gradient-to-br from-white to-zinc-900 border' },
  ];

  if (!mounted) return null;

  return (
    <div className="space-y-5">
      {/* Theme */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Theme</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {themeOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setTheme(opt.value)}
                className={cn(
                  'relative flex flex-col items-center gap-2 rounded-xl border-2 p-3 transition-all',
                  theme === opt.value ? 'border-[#534AB7]' : 'border-border hover:border-muted-foreground/40',
                )}
              >
                <div className={cn('h-16 w-full rounded-lg', opt.preview)}>
                  <div className="m-2 h-2 w-12 rounded bg-current opacity-20" />
                  <div className="mx-2 mt-1 h-1.5 w-8 rounded bg-current opacity-10" />
                </div>
                <span className="text-xs font-medium">{opt.label}</span>
                {theme === opt.value && (
                  <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#534AB7]">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Accent color */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Accent color</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {ACCENT_COLORS.map((color) => (
              <button
                key={color.value}
                onClick={() => setAccent(color.value)}
                title={color.name}
                className={cn(
                  'relative h-10 w-10 rounded-full transition-transform hover:scale-110',
                  accent === color.value && 'ring-2 ring-offset-2 ring-offset-background',
                )}
                style={{ backgroundColor: color.value, ...(accent === color.value ? { ringColor: color.value } : {}) }}
              >
                {accent === color.value && (
                  <Check className="absolute inset-0 m-auto h-4 w-4 text-white" />
                )}
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Preview: <span className="font-semibold" style={{ color: accent }}>SkillArena</span>
          </p>
        </CardContent>
      </Card>

      {/* Font size */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Font size</CardTitle></CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {(['small', 'medium', 'large'] as const).map((size) => (
              <button
                key={size}
                onClick={() => setFontSize(size)}
                className={cn(
                  'flex-1 rounded-lg border py-2 text-sm font-medium capitalize transition-colors',
                  fontSize === size ? 'border-[#534AB7] bg-[#534AB7]/10 text-[#534AB7]' : 'hover:bg-accent',
                )}
              >
                {size}
              </button>
            ))}
          </div>
          <div className="mt-4 rounded-lg border p-4">
            <p className="text-muted-foreground" style={{ fontSize: fontSize === 'small' ? '13px' : fontSize === 'large' ? '18px' : '15px' }}>
              Preview text — The quick brown fox jumps over the lazy dog.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Code editor preferences */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Code editor preferences</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Editor theme</label>
            <select value={editorTheme} onChange={(e) => setEditorTheme(e.target.value)}
              className="input">
              {EDITOR_THEMES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Font size</label>
              <span className="text-sm font-mono text-[#534AB7]">{editorFontSize}px</span>
            </div>
            <input type="range" min={12} max={20} value={editorFontSize}
              onChange={(e) => setEditorFontSize(Number(e.target.value))}
              className="w-full accent-[#534AB7]" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>12px</span><span>20px</span>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Tab size</label>
            <div className="flex gap-2">
              {([2, 4] as const).map((size) => (
                <button key={size} onClick={() => setTabSize(size)}
                  className={cn(
                    'flex-1 rounded-lg border py-2 text-sm font-medium transition-colors',
                    tabSize === size ? 'border-[#534AB7] bg-[#534AB7]/10 text-[#534AB7]' : 'hover:bg-accent',
                  )}>
                  {size} spaces
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-lg bg-zinc-950 p-4 font-mono text-sm text-zinc-100"
            style={{ fontSize: `${editorFontSize}px` }}>
            <span className="text-blue-400">function</span>{' '}
            <span className="text-yellow-300">solve</span>
            <span className="text-zinc-300">() {'{'}</span>
            <br />
            <span style={{ paddingLeft: `${tabSize * 8}px` }} className="text-zinc-300">
              <span className="text-blue-400">return</span>{' '}
              <span className="text-green-400">'hello'</span>;
            </span>
            <br />
            <span className="text-zinc-300">{'}'}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
