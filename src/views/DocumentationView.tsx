import React from 'react';
import { Container, Grid } from '../components/layout';
import { Heading, Text, Label } from '../components/typography';
import { Card, CardHeader, CardBody, Button, Badge } from '../components/ui';
import Logo from '../components/brand/Logo';

// --- Helper Components ---

const SectionHeader: React.FC<{ number: string; title: string; description?: string }> = ({ number, title, description }) => (
  <div className="mb-8">
    <div className="flex items-center gap-3 mb-2">
      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-brand-100 text-brand-700 font-bold text-xs">{number}</span>
      <Heading level={2} size="h3" className="text-slate-900">{title}</Heading>
    </div>
    {description && <Text className="text-slate-600 max-w-3xl ml-9">{description}</Text>}
  </div>
);

const ColorSwatch: React.FC<{ name: string; hex: string; role: string; textClass?: string }> = ({ name, hex, role, textClass = "text-slate-500" }) => (
  <div className="space-y-2">
    <div className="h-24 rounded-2xl shadow-sm border border-slate-100 relative group overflow-hidden" style={{ backgroundColor: hex }}>
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
    </div>
    <div>
      <div className="flex justify-between items-baseline">
        <p className="font-bold text-slate-900 text-sm">{name}</p>
        <p className={`text-xs font-mono ${textClass}`}>{hex}</p>
      </div>
      <p className="text-[10px] uppercase tracking-widest text-slate-400 mt-0.5">{role}</p>
    </div>
  </div>
);

const DoDontCard: React.FC<{ type: 'do' | 'dont'; title: string; children: React.ReactNode }> = ({ type, title, children }) => (
  <div className={`p-6 rounded-2xl border-l-4 ${type === 'do' ? 'bg-emerald-50 border-emerald-500' : 'bg-rose-50 border-rose-500'}`}>
    <div className="flex items-center gap-2 mb-3">
      {type === 'do' ? (
        <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
      ) : (
        <svg className="w-5 h-5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
      )}
      <span className={`text-xs font-black uppercase tracking-widest ${type === 'do' ? 'text-emerald-700' : 'text-rose-700'}`}>
        {type === 'do' ? 'Do' : "Don't"}
      </span>
    </div>
    <p className={`font-bold mb-2 ${type === 'do' ? 'text-emerald-900' : 'text-rose-900'}`}>{title}</p>
    <div className={`text-sm ${type === 'do' ? 'text-emerald-800' : 'text-rose-800'}`}>
      {children}
    </div>
  </div>
);

const DocumentationView: React.FC = () => {
  return (
    <div className="bg-[#F8FAFC] min-h-screen pb-24 pt-24 font-sans selection:bg-brand-100 selection:text-brand-900">
      
      {/* ── Header ────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200 mb-16">
        <Container className="py-20">
          <div className="max-w-4xl">
            <div className="flex items-center gap-3 mb-6">
              <span className="px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-[10px] font-black uppercase tracking-widest border border-brand-100">Internal Use Only</span>
              <span className="text-slate-400 text-xs font-mono">v1.2.0 • Updated Oct 2024</span>
            </div>
            <Heading level={1} size="display" className="mb-6 tracking-tight text-slate-900">
              EvoWell Design System
            </Heading>
            <Text variant="lead" className="text-slate-600 max-w-2xl leading-relaxed">
              A comprehensive guide to building calm, credible, and clinically grounded digital experiences for the EvoWell healthcare ecosystem.
            </Text>
          </div>
        </Container>
      </div>

      <Container>
        <div className="grid grid-cols-1 gap-24">

          {/* ── 1. Foundation ───────────────────────────────────────── */}
          <section id="foundation">
            <SectionHeader number="01" title="Brand Foundation" description="The core principles that drive every design decision." />
            
            <Grid cols={1} gap="lg" className="md:grid-cols-2 lg:grid-cols-3 mb-12">
              <Card className="p-8 h-full bg-white border-slate-200">
                <Label variant="overline" color="brand" className="mb-4">Mission</Label>
                <p className="text-lg font-medium text-slate-900 leading-relaxed">
                  To connect individuals with vetted, evidence-based care in a calm, stigma-free environment.
                </p>
              </Card>
              <Card className="p-8 h-full bg-white border-slate-200 lg:col-span-2">
                <Label variant="overline" color="brand" className="mb-4">Values</Label>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <p className="font-bold text-slate-900 mb-1">{"Evidence > Hype"}</p>
                    <p className="text-sm text-slate-600">We prioritize clinical validity over wellness trends. If it's not grounded in science, it's not on EvoWell.</p>
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 mb-1">Human-Centered</p>
                    <p className="text-sm text-slate-600">Technology serves the relationship between provider and patient, never replacing it.</p>
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 mb-1">Inclusive by Default</p>
                    <p className="text-sm text-slate-600">Our design must be accessible to everyone, regardless of ability, background, or tech-literacy.</p>
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 mb-1">Calm Confidence</p>
                    <p className="text-sm text-slate-600">We avoid alarmist language and cluttered interfaces. We create space for healing.</p>
                  </div>
                </div>
              </Card>
            </Grid>
          </section>

          {/* ── 2. Logo System ──────────────────────────────────────── */}
          <section id="logo">
            <SectionHeader number="02" title="Logo System" description="Our mark is a symbol of continuous growth and clinical trust." />
            
            <div className="space-y-8">
              <Grid cols={1} gap="lg" className="md:grid-cols-2">
                <div className="space-y-4">
                  <div className="bg-white border border-slate-100 rounded-3xl p-12 flex items-center justify-center min-h-[240px]">
                    <img src="/images/colored-logo.svg" alt="Primary Logo" className="h-12" />
                  </div>
                  <div className="flex justify-between px-2">
                    <span className="text-xs font-bold text-slate-900">Primary Lockup</span>
                    <span className="text-xs font-mono text-slate-400">colored-logo.svg</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 flex items-center justify-center min-h-[240px]">
                    <img src="/images/logo.svg" alt="Dark Mode Logo" className="h-12 brightness-0 invert" />
                  </div>
                  <div className="flex justify-between px-2">
                    <span className="text-xs font-bold text-slate-900">Reverse / Dark Mode</span>
                    <span className="text-xs font-mono text-slate-400">logo.svg (white)</span>
                  </div>
                </div>
              </Grid>

              <Card className="p-8 bg-slate-50 border-slate-200">
                <Heading level={4} className="mb-6 text-sm">Usage Guidelines</Heading>
                <Grid cols={1} gap="md" className="md:grid-cols-2 lg:grid-cols-4">
                  <DoDontCard type="dont" title="No Stretching">
                    <div className="h-16 flex items-center justify-center bg-white rounded-lg mb-2 opacity-50 grayscale border border-rose-100">
                      <div className="w-24 h-6 bg-slate-300 rounded transform scale-x-150"></div>
                    </div>
                    Never distort the aspect ratio.
                  </DoDontCard>
                  <DoDontCard type="dont" title="No Drop Shadows">
                    <div className="h-16 flex items-center justify-center bg-white rounded-lg mb-2 opacity-50 grayscale border border-rose-100">
                      <div className="w-24 h-6 bg-slate-300 rounded shadow-xl"></div>
                    </div>
                    Keep the logo flat and clean.
                  </DoDontCard>
                  <DoDontCard type="do" title="Clear Space">
                    <div className="h-16 flex items-center justify-center bg-white rounded-lg mb-2 border border-emerald-100 relative">
                      <div className="w-20 h-5 bg-slate-800 rounded"></div>
                      <div className="absolute inset-2 border border-dashed border-emerald-300"></div>
                    </div>
                    Min padding: 50% of icon height.
                  </DoDontCard>
                  <DoDontCard type="do" title="Min Size">
                    <div className="h-16 flex items-center justify-center bg-white rounded-lg mb-2 border border-emerald-100">
                      <div className="text-[10px] text-slate-400">24px height</div>
                    </div>
                    Legibility is paramount.
                  </DoDontCard>
                </Grid>
              </Card>
            </div>
          </section>

          {/* ── 3. Color System ─────────────────────────────────────── */}
          <section id="color">
            <SectionHeader number="03" title="Color System" description="A WCAG 2.1 AA compliant palette designed for clarity and reducing cognitive load." />
            
            <div className="space-y-12">
              <div>
                <Label variant="overline" color="muted" className="mb-6">Brand Primary</Label>
                <Grid cols={2} gap="md" className="md:grid-cols-4 lg:grid-cols-6">
                  <ColorSwatch name="Brand 50" hex="#F0F9FF" role="Backgrounds / Wash" />
                  <ColorSwatch name="Brand 100" hex="#E0F2FE" role="Hover Backgrounds" />
                  <ColorSwatch name="Brand 200" hex="#BAE6FD" role="Borders / Dividers" />
                  <ColorSwatch name="Brand 500" hex="#0EA5E9" role="Primary Actions" />
                  <ColorSwatch name="Brand 600" hex="#0284C7" role="Hover Actions" />
                  <ColorSwatch name="Brand 900" hex="#0C4A6E" role="Text on Light" />
                </Grid>
              </div>

              <div>
                <Label variant="overline" color="muted" className="mb-6">Neutrals (Slate)</Label>
                <Grid cols={2} gap="md" className="md:grid-cols-4 lg:grid-cols-6">
                  <ColorSwatch name="White" hex="#FFFFFF" role="Surface / Cards" />
                  <ColorSwatch name="Slate 50" hex="#F8FAFC" role="Page Background" />
                  <ColorSwatch name="Slate 200" hex="#E2E8F0" role="Borders" />
                  <ColorSwatch name="Slate 400" hex="#94A3B8" role="Placeholder Text" />
                  <ColorSwatch name="Slate 600" hex="#475569" role="Body Text" />
                  <ColorSwatch name="Slate 900" hex="#0F172A" role="Headings" />
                </Grid>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <Card className="p-6 bg-slate-50 border-slate-200">
                  <Heading level={4} className="mb-4 text-sm">Semantic States</Heading>
                  <div className="space-y-3">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-emerald-500 shadow-sm"></div>
                      <div>
                        <p className="font-bold text-sm text-slate-900">Success (Emerald)</p>
                        <p className="text-xs text-slate-500">Completed actions, verifications</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-amber-500 shadow-sm"></div>
                      <div>
                        <p className="font-bold text-sm text-slate-900">Warning (Amber)</p>
                        <p className="text-xs text-slate-500">Non-blocking alerts, pending states</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-rose-500 shadow-sm"></div>
                      <div>
                        <p className="font-bold text-sm text-slate-900">Error (Rose)</p>
                        <p className="text-xs text-slate-500">Destructive actions, validation errors</p>
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="p-6 bg-slate-50 border-slate-200">
                  <Heading level={4} className="mb-4 text-sm">Usage Ratios</Heading>
                  <div className="h-4 w-full rounded-full flex overflow-hidden mb-4">
                    <div className="w-[60%] bg-white"></div>
                    <div className="w-[30%] bg-slate-50"></div>
                    <div className="w-[10%] bg-brand-500"></div>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>60% White (Surface)</span>
                    <span>30% Slate (Structure)</span>
                    <span className="text-brand-600 font-bold">10% Brand (Action)</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-4 leading-relaxed">
                    Avoid overusing brand colors. Blue should signal interactivity or key information, not decoration.
                  </p>
                </Card>
              </div>
            </div>
          </section>

          {/* ── 4. Typography ───────────────────────────────────────── */}
          <section id="typography">
            <SectionHeader number="04" title="Typography System" description="Plus Jakarta Sans was chosen for its modern geometric structure and high legibility at small sizes." />
            
            <Card className="overflow-hidden bg-white border-slate-200">
              <div className="grid lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
                <div className="p-8 md:p-12 space-y-10">
                  <div>
                    <Label variant="overline" color="muted" className="mb-4">Display</Label>
                    <p className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-[1.1]">
                      Mental Health <br /><span className="text-brand-500">Reimagined.</span>
                    </p>
                    <p className="mt-2 text-xs font-mono text-slate-400">Plus Jakarta Sans / Black / Tight</p>
                  </div>
                  <div>
                    <Label variant="overline" color="muted" className="mb-4">Heading 1</Label>
                    <p className="text-4xl font-black text-slate-900 tracking-tight">
                      Clinical Excellence
                    </p>
                    <p className="mt-2 text-xs font-mono text-slate-400">Plus Jakarta Sans / Black / Tight</p>
                  </div>
                  <div>
                    <Label variant="overline" color="muted" className="mb-4">Heading 2</Label>
                    <p className="text-3xl font-bold text-slate-900 tracking-tight">
                      Patient Outcomes First
                    </p>
                    <p className="mt-2 text-xs font-mono text-slate-400">Plus Jakarta Sans / Bold / Tight</p>
                  </div>
                </div>
                <div className="p-8 md:p-12 space-y-10 bg-slate-50/50">
                  <div>
                    <Label variant="overline" color="muted" className="mb-4">Body (Large)</Label>
                    <p className="text-xl font-medium text-slate-900 leading-relaxed">
                      Our platform connects you with vetted specialists who understand your unique needs.
                    </p>
                    <p className="mt-2 text-xs font-mono text-slate-400">Plus Jakarta Sans / Medium / Relaxed</p>
                  </div>
                  <div>
                    <Label variant="overline" color="muted" className="mb-4">Body (Default)</Label>
                    <p className="text-base text-slate-600 leading-relaxed max-w-md">
                      Standard body text is set in Slate 600 to reduce eye strain while maintaining sufficient contrast (4.5:1 minimum). Line length should never exceed 75 characters for optimal readability.
                    </p>
                    <p className="mt-2 text-xs font-mono text-slate-400">Plus Jakarta Sans / Regular / Relaxed</p>
                  </div>
                  <div>
                    <Label variant="overline" color="muted" className="mb-4">UI & Labels</Label>
                    <div className="flex gap-4">
                      <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Overline</span>
                      <span className="text-sm font-bold text-slate-900">Button Text</span>
                      <span className="text-xs font-medium text-slate-500">Helper text</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </section>

          {/* ── 5. Voice & Tone ─────────────────────────────────────── */}
          <section id="voice">
            <SectionHeader number="05" title="Voice & Content" description="We speak with clarity, empathy, and authority." />
            
            <Grid cols={1} gap="lg" className="md:grid-cols-2">
              <Card className="p-8 bg-white border-slate-200">
                <Label variant="overline" color="brand" className="mb-6">Principles</Label>
                <ul className="space-y-4">
                  <li className="flex gap-3">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span className="text-slate-700 text-sm"><strong>Plain Language:</strong> Explain complex clinical terms simply.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span className="text-slate-700 text-sm"><strong>Short Sentences:</strong> Respect the user's cognitive load.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span className="text-slate-700 text-sm"><strong>Empathetic:</strong> Acknowledge the user's journey without being patronizing.</span>
                  </li>
                </ul>
              </Card>
              <Card className="p-8 bg-slate-900 text-white border-slate-800">
                <Label variant="overline" className="text-blue-400 mb-6">AI Guidelines</Label>
                <div className="space-y-4 text-sm opacity-90 leading-relaxed">
                  <p><strong>Transparency:</strong> Always disclose when content or interactions are AI-generated.</p>
                  <p><strong>Safety:</strong> AI features must never offer definitive medical diagnoses.</p>
                  <p><strong>Supportive:</strong> AI is a tool to augment the provider-patient relationship, not replace it.</p>
                </div>
              </Card>
            </Grid>
          </section>

          {/* ── 6. UI Components ────────────────────────────────────── */}
          <section id="components">
            <SectionHeader number="06" title="Component Library" description="Core interactive elements." />
            
            <div className="space-y-8">
              {/* Buttons */}
              <div className="space-y-4">
                <Label variant="overline" color="muted">Buttons</Label>
                <div className="flex flex-wrap gap-4 items-center">
                  <Button variant="brand">Primary Brand</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="ghost">Ghost Action</Button>
                  <button disabled className="bg-slate-100 text-slate-400 px-6 py-3 rounded-xl font-bold text-sm cursor-not-allowed">Disabled</button>
                </div>
              </div>

              {/* Form Elements */}
              <div className="space-y-4 max-w-2xl">
                <Label variant="overline" color="muted">Form Inputs</Label>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 ml-1">Default Input</label>
                    <input className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 outline-none focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all" placeholder="Type here..." />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-rose-600 ml-1">Error State</label>
                    <input className="w-full bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 text-sm font-medium text-rose-900 placeholder:text-rose-400 outline-none focus:ring-4 focus:ring-rose-500/10 transition-all" placeholder="Invalid input" defaultValue="Invalid value" />
                  </div>
                </div>
              </div>

              {/* Badges */}
              <div className="space-y-4">
                <Label variant="overline" color="muted">Badges & Tags</Label>
                <div className="flex gap-3">
                  <Badge variant="brand">New Feature</Badge>
                  <Badge variant="neutral">Documentation</Badge>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">Verified</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">Pending</span>
                </div>
              </div>
            </div>
          </section>

          {/* ── 7. Spacing ──────────────────────────────────────────── */}
          <section id="spacing">
            <SectionHeader number="07" title="Spacing & Layout" />
            <Grid cols={2} gap="md" className="md:grid-cols-4">
              {[4, 8, 16, 24, 32, 48, 64, 96].map(px => (
                <div key={px} className="space-y-2">
                  <div className="bg-brand-100 rounded-lg" style={{ width: px, height: px }}></div>
                  <p className="text-xs font-mono text-slate-500">{px}px ({px/4} unit)</p>
                </div>
              ))}
            </Grid>
          </section>

          {/* ── 8. Imagery ──────────────────────────────────────────── */}
          <section id="imagery">
            <SectionHeader number="08" title="Imagery" description="Authentic, diverse, and grounded." />
            <Grid cols={1} gap="lg" className="md:grid-cols-2">
              <Card className="overflow-hidden bg-white border-slate-200">
                <div className="aspect-video bg-slate-100 flex items-center justify-center text-slate-400">
                  (Placeholder: Diverse provider portrait)
                </div>
                <CardBody className="p-6">
                  <Heading level={4} className="mb-2 text-sm">Photography</Heading>
                  <Text variant="small">Use high-resolution images of real people. Avoid staged stock photos with unnatural lighting. Subjects should look at the camera or engage naturally.</Text>
                </CardBody>
              </Card>
              <Card className="overflow-hidden bg-white border-slate-200">
                <div className="aspect-video bg-slate-100 flex items-center justify-center text-slate-400">
                  (Placeholder: Clean interface screenshot)
                </div>
                <CardBody className="p-6">
                  <Heading level={4} className="mb-2 text-sm">Product Visuals</Heading>
                  <Text variant="small">Show the actual platform UI. Use subtle drop shadows and rounded corners to present screenshots properly.</Text>
                </CardBody>
              </Card>
            </Grid>
          </section>

          {/* ── 9. Accessibility ────────────────────────────────────── */}
          <section id="a11y">
            <SectionHeader number="09" title="Accessibility" description="WCAG 2.1 AA is our baseline." />
            <Card className="bg-slate-900 text-white p-8 md:p-10 border-slate-800">
              <div className="grid md:grid-cols-3 gap-8">
                <div>
                  <h4 className="font-bold text-white mb-2">Contrast</h4>
                  <p className="text-sm text-slate-400">All text must meet 4.5:1 contrast ratio against its background. Large text (18pt+) must meet 3:1.</p>
                </div>
                <div>
                  <h4 className="font-bold text-white mb-2">Keyboard</h4>
                  <p className="text-sm text-slate-400">All interactive elements must be navigable via Tab. Focus states must be clearly visible (ring/outline).</p>
                </div>
                <div>
                  <h4 className="font-bold text-white mb-2">Structure</h4>
                  <p className="text-sm text-slate-400">Use semantic HTML headings (h1-h6) in order. Always provide alt text for images.</p>
                </div>
              </div>
            </Card>
          </section>

          {/* ── 10. Governance ─────────────────────────────────────── */}
          <section id="governance" className="border-t border-slate-200 pt-12 mt-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <Heading level={3} className="text-slate-900 mb-1">System Governance</Heading>
                <Text variant="small">Maintained by the EvoWell Product Design Team.</Text>
              </div>
              <div className="flex gap-8 text-xs font-mono text-slate-500">
                <div>
                  <span className="block text-slate-300 uppercase tracking-widest mb-1">Version</span>
                  1.2.0
                </div>
                <div>
                  <span className="block text-slate-300 uppercase tracking-widest mb-1">Last Updated</span>
                  October 24, 2024
                </div>
                <div>
                  <span className="block text-slate-300 uppercase tracking-widest mb-1">Status</span>
                  <span className="text-emerald-600 font-bold">Stable</span>
                </div>
              </div>
            </div>
          </section>

        </div>
      </Container>
    </div>
  );
};

export default DocumentationView;
