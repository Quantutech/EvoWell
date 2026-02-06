import React, { useState } from 'react';
import Breadcrumb from '../components/Breadcrumb';
import { useToast } from '../contexts/ToastContext';
import { sanitizeHTML } from '../utils/content-sanitizer';
import { PageHero, Section, Container } from '../components/layout';
import { Heading, Text, Label } from '../components/typography';
import { Button, Card, Select } from '../components/ui';
import Icon from '../components/ui/Icon';
import { iconPaths } from '../components/ui/iconPaths';

const SupportView: React.FC<{ type: 'contact' | 'faq' | 'help' }> = ({ type }) => {
  const pageTitle = type === 'faq' ? 'Frequently Asked Questions' : type === 'help' ? 'Help Center' : 'Contact Us';
  const { addToast } = useToast();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    topic: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Sanitize inputs
    const sanitizedData = {
      firstName: sanitizeHTML(formData.firstName),
      lastName: sanitizeHTML(formData.lastName),
      email: sanitizeHTML(formData.email),
      topic: sanitizeHTML(formData.topic),
      message: sanitizeHTML(formData.message)
    };

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    addToast('success', `Thanks ${sanitizedData.firstName}, your message has been sent!`);
    
    // Clear form
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      topic: '',
      message: ''
    });
    setIsSubmitting(false);
  };

  return (
    <div className="bg-[#fbfcff] min-h-screen">
      <Breadcrumb items={[{ label: pageTitle }]} />
      
      {type === 'contact' ? (
        <Section spacing="sm" className="pt-20 pb-32">
          <Container>
            <div className="grid lg:grid-cols-5 gap-12 items-start">
              {/* Left Column: Info */}
              <div className="lg:col-span-2 space-y-10 pt-4">
                <div>
                  <Label variant="overline" className="text-brand-500 mb-4">Contact Us</Label>
                  <Heading level={1} className="mb-6">We'd love to hear from you.</Heading>
                  <Text className="text-slate-600 text-lg leading-relaxed">
                    Have a question about the platform? Our team is ready to help you navigate your wellness journey.
                  </Text>
                </div>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
                      <Icon path={iconPaths.chat} size={24} className="text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm mb-1">Chat Support</h4>
                      <p className="text-slate-500 text-sm mb-2">Our friendly team is here to help.</p>
                      <a href="mailto:support@evowell.com" className="text-brand-600 font-bold text-sm hover:text-brand-700">support@evowell.com</a>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center shrink-0">
                      <Icon path={iconPaths.globe} size={24} className="text-indigo-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm mb-1">Office</h4>
                      <p className="text-slate-500 text-sm mb-2">Come say hello at our office HQ.</p>
                      <p className="text-slate-900 font-medium text-sm">100 Smith Street<br />Collingwood VIC 3066 AU</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Form */}
              <div className="lg:col-span-3">
                <Card className="p-8 md:p-10 shadow-2xl shadow-slate-200/50 border-slate-100 bg-white">
                  <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="ml-1 text-slate-700 font-bold">First Name</Label>
                        <input 
                          required
                          value={formData.firstName}
                          onChange={e => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                          className="w-full bg-white border border-slate-200 rounded-xl px-5 py-4 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all" 
                          placeholder="First name" 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="ml-1 text-slate-700 font-bold">Last Name</Label>
                        <input 
                          required
                          value={formData.lastName}
                          onChange={e => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                          className="w-full bg-white border border-slate-200 rounded-xl px-5 py-4 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all" 
                          placeholder="Last name" 
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="ml-1 text-slate-700 font-bold">Email</Label>
                      <input 
                        required
                        type="email"
                        value={formData.email}
                        onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full bg-white border border-slate-200 rounded-xl px-5 py-4 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all" 
                        placeholder="you@company.com" 
                      />
                    </div>

                    <div className="space-y-2">
                      <Select
                        label="Topic"
                        placeholder="What can we help you with?"
                        options={[
                          'Account Support',
                          'Billing Question',
                          'Technical Issue',
                          'Feedback',
                          'Partnership Inquiry'
                        ]}
                        value={formData.topic}
                        onChange={val => setFormData(prev => ({ ...prev, topic: val }))}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="ml-1 text-slate-700 font-bold">Message</Label>
                      <textarea 
                        required
                        value={formData.message}
                        onChange={e => setFormData(prev => ({ ...prev, message: e.target.value }))}
                        rows={5} 
                        className="w-full bg-white border border-slate-200 rounded-xl px-5 py-4 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all resize-none" 
                        placeholder="Tell us more about your inquiry..." 
                      />
                    </div>
                    
                    <div className="pt-4">
                      <Button 
                        type="submit"
                        fullWidth 
                        variant="brand" 
                        disabled={isSubmitting}
                        className="py-4 text-sm shadow-lg shadow-brand-500/20 rounded-xl"
                      >
                        {isSubmitting ? 'Sending...' : 'Send Message'}
                      </Button>
                    </div>
                  </form>
                </Card>
              </div>
            </div>
          </Container>
        </Section>
      ) : (
        <>
          <PageHero
            overline="Support Center"
            title={pageTitle}
            description="Our clinical support team is here to ensure your experience on EvoWell is seamless, secure, and supportive."
            variant="centered"
          />

          <Section spacing="sm">
            <Container size="narrow">
              <Card variant="default" size="lg">
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
        </>
      )}
    </div>
  );
};

export default SupportView;