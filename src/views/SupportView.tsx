import React from 'react';
import Breadcrumb from '../components/Breadcrumb';
import { PageHero, Section, Container } from '../components/layout';
import { Heading, Text, Label } from '../components/typography';
import { Button, Card, CardBody } from '../components/ui';

const SupportView: React.FC<{ type: 'contact' | 'faq' | 'help' }> = ({ type }) => {
  const pageTitle = type === 'faq' ? 'Frequently Asked Questions' : type === 'help' ? 'Help Center' : 'Contact Us';
  return (
    <div className="bg-[#fbfcff] min-h-screen">
      <Breadcrumb items={[{ label: pageTitle }]} />
      
      <PageHero
        overline="Support Center"
        title={pageTitle}
        description="Our clinical support team is here to ensure your experience on EvoWell is seamless, secure, and supportive."
        variant="centered"
      />

      <Section spacing="sm">
        <Container size="narrow">
          <Card variant="default" size="lg">
            {type === 'contact' && (
              <form className="space-y-8 max-w-2xl mx-auto" onSubmit={e => e.preventDefault()}>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <Label className="ml-1">Name</Label>
                    <input className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-medium outline-none focus:ring-2 focus:ring-brand-500/10" placeholder="Your Name" />
                  </div>
                  <div className="space-y-2">
                    <Label className="ml-1">Email</Label>
                    <input className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-medium outline-none focus:ring-2 focus:ring-brand-500/10" placeholder="your@email.com" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="ml-1">Message</Label>
                  <textarea rows={6} className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-medium outline-none focus:ring-2 focus:ring-brand-500/10 resize-none" placeholder="How can we help?" />
                </div>
                <Button fullWidth variant="brand">Send Message</Button>
              </form>
            )}

            {type === 'faq' && (
              <div className="space-y-6">
                {[
                  { q: "How do I book an appointment?", a: "Navigate to a provider's profile and use the scheduling calendar to select a time slot that works for you." },
                  { q: "Is my data secure?", a: "Yes. We use AES-256 encryption and HIPAA-compliant data storage protocols for all clinical information." },
                  { q: "Can I use insurance?", a: "Many providers accept insurance. You can filter the directory by your insurance carrier." },
                  { q: "What if I need to cancel?", a: "Cancellations can be made through your patient dashboard up to 24 hours before your scheduled session." }
                ].map((item, i) => (
                  <div key={i} className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
                    <Heading level={3} size="h4" className="mb-2">{item.q}</Heading>
                    <Text variant="small">{item.a}</Text>
                  </div>
                ))}
              </div>
            )}

            {type === 'help' && (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-brand-50 text-brand-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                </div>
                <Heading level={2} className="mb-4">Need technical assistance?</Heading>
                <Text className="mb-8 max-w-md mx-auto">Our support team is available Mon-Fri 9am-5pm EST to assist with account access, billing, and technical issues.</Text>
                <div className="flex justify-center gap-4">
                  <Button as="a" href="mailto:support@evowell.com" variant="primary">Email Support</Button>
                  <Button variant="secondary">Live Chat</Button>
                </div>
              </div>
            )}
          </Card>
        </Container>
      </Section>
    </div>
  );
};

export default SupportView;