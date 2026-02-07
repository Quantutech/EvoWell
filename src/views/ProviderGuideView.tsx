import React from 'react';
import { useNavigation } from '../App';
import Breadcrumb from '../components/Breadcrumb';
import { PageHero, Section, Container } from '../components/layout';
import { Heading, Text, Label } from '../components/typography';
import { Button } from '../components/ui';
import Icon from '../components/ui/Icon';
import { iconPaths } from '../components/ui/iconPaths';

const ProviderGuideView: React.FC = () => {
  const { navigate } = useNavigation();

  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      <Breadcrumb items={[{ label: 'Provider Guide' }]} />

      {/* Hero */}
      <PageHero
        overline="Join the Family"
        title="Start Your Journey with EvoWell"
        description="A step-by-step guide to launching your digital practice, connecting with clients, and growing your business on our platform."
        actions={
          <Button size="lg" variant="brand" onClick={() => navigate('#/login?join=true')}>
            Start Application
          </Button>
        }
      />

      {/* Value Prop */}
      <Section spacing="lg" background="white">
        <Container>
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <Heading level={2} className="mb-6">More Than Just a Directory</Heading>
            <Text variant="lead" className="text-slate-600">
              We provide the infrastructure you need to focus on what matters: your patients. From secure video telehealth to automated billing and detailed analytics, we handle the heavy lifting.
            </Text>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                <Icon path={iconPaths.chart} size={24} />
              </div>
              <Heading level={4} className="mb-3">Business Growth</Heading>
              <Text className="text-slate-500">Track your practice health with our analytics dashboard. See client retention, revenue trends, and booking patterns at a glance.</Text>
            </div>
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
              <div className="w-12 h-12 bg-brand-100 text-brand-600 rounded-xl flex items-center justify-center mb-6">
                <Icon path={iconPaths.calendar} size={24} />
              </div>
              <Heading level={4} className="mb-3">Seamless Scheduling</Heading>
              <Text className="text-slate-500">Set your availability and let clients book directly. Our system handles time zones, reminders, and cancellations automatically.</Text>
            </div>
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-6">
                <Icon path={iconPaths.shield} size={24} />
              </div>
              <Heading level={4} className="mb-3">Verified Trust</Heading>
              <Text className="text-slate-500">Our rigorous verification process builds trust with clients before the first session. Join a network of vetted professionals.</Text>
            </div>
          </div>

          {/* Dashboard Visual Placeholder */}
          <div className="border-4 border-dashed border-slate-200 rounded-[2rem] bg-slate-50 p-12 text-center aspect-[16/9] flex flex-col items-center justify-center group hover:border-brand-300 transition-colors">
             <div className="mb-4 text-slate-300 group-hover:text-brand-400 transition-colors">
               <Icon path={iconPaths.dashboard} size={64} />
             </div>
             <Heading level={3} className="text-slate-400 mb-2 uppercase tracking-widest">Dashboard Analytics</Heading>
             <Text className="text-slate-400 max-w-md mx-auto">
               [Insert Real Dashboard Screenshot Here: Showing monthly revenue chart, upcoming appointments list, and patient stats]
             </Text>
          </div>
        </Container>
      </Section>

      {/* Onboarding Steps */}
      <Section spacing="lg" className="bg-slate-900 text-white">
        <Container>
          <div className="text-center mb-16">
            <Label variant="overline" className="text-brand-400 mb-4">The Process</Label>
            <Heading level={2} color="white">How to Get Started</Heading>
          </div>

          <div className="space-y-24">
            {/* Step 1 */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="w-16 h-16 rounded-2xl bg-brand-500 text-white flex items-center justify-center text-2xl font-black mb-6">1</div>
                <Heading level={3} color="white" className="mb-4">Create Your Account</Heading>
                <Text className="text-slate-400 text-lg mb-6">
                  Start by registering with your professional email. You'll choose your subscription tier (starting with our free trial) and set up your basic login credentials.
                </Text>
                <Button variant="secondary" onClick={() => navigate('#/login?join=true')}>Register Now</Button>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-3xl p-8 aspect-video flex items-center justify-center text-center">
                 <div className="opacity-50">
                    <Heading level={4} color="white" className="mb-2">Sign Up Screen</Heading>
                    <Text className="text-slate-500 text-sm">[Insert Screenshot of Registration Form]</Text>
                 </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="grid md:grid-cols-2 gap-12 items-center md:flex-row-reverse">
              <div className="md:order-2">
                <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-2xl font-black mb-6">2</div>
                <Heading level={3} color="white" className="mb-4">Build Your Profile</Heading>
                <Text className="text-slate-400 text-lg mb-6">
                  This is your digital storefront. Upload a professional headshot, write your bio, and select your clinical specialties. You'll also set your hourly rates and session types (Video, Audio, In-Person).
                </Text>
              </div>
              <div className="md:order-1 bg-white/5 border border-white/10 rounded-3xl p-8 aspect-video flex items-center justify-center text-center">
                 <div className="opacity-50">
                    <Heading level={4} color="white" className="mb-2">Profile Editor</Heading>
                    <Text className="text-slate-500 text-sm">[Insert Screenshot of Profile Builder Step 1]</Text>
                 </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="w-16 h-16 rounded-2xl bg-purple-600 text-white flex items-center justify-center text-2xl font-black mb-6">3</div>
                <Heading level={3} color="white" className="mb-4">Verify Identity & Credentials</Heading>
                <Text className="text-slate-400 text-lg mb-6">
                  Safety is our priority. You'll need to upload a government ID and your state medical license or certification. Our clinical team reviews these documents within 48 hours.
                </Text>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-3xl p-8 aspect-video flex items-center justify-center text-center">
                 <div className="opacity-50">
                    <Heading level={4} color="white" className="mb-2">Verification Upload</Heading>
                    <Text className="text-slate-500 text-sm">[Insert Screenshot of Document Upload Step]</Text>
                 </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="grid md:grid-cols-2 gap-12 items-center md:flex-row-reverse">
              <div className="md:order-2">
                <div className="w-16 h-16 rounded-2xl bg-green-500 text-white flex items-center justify-center text-2xl font-black mb-6">4</div>
                <Heading level={3} color="white" className="mb-4">Go Live & Grow</Heading>
                <Text className="text-slate-400 text-lg mb-6">
                  Once approved, your profile becomes visible in our directory. Clients can book sessions instantly based on your real-time availability. You'll receive notifications for every new appointment.
                </Text>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-3xl p-8 aspect-video flex items-center justify-center text-center">
                 <div className="opacity-50">
                    <Heading level={4} color="white" className="mb-2">Live Public Profile</Heading>
                    <Text className="text-slate-500 text-sm">[Insert Screenshot of a Finished Provider Profile]</Text>
                 </div>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* CTA */}
      <Section spacing="lg" background="default">
        <Container className="text-center">
          <div className="bg-brand-500 rounded-[3rem] p-16 shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[60px]"></div>
             <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-[60px]"></div>
             
             <div className="relative z-10">
               <Heading level={2} color="white" className="mb-6">Ready to expand your practice?</Heading>
               <Text variant="lead" className="text-brand-100 mb-10 max-w-2xl mx-auto">
                 Join thousands of providers who trust EvoWell to manage and grow their business.
               </Text>
               <div className="flex justify-center gap-4">
                 <Button size="lg" className="bg-white text-brand-600 hover:bg-brand-50 shadow-xl" onClick={() => navigate('#/login?join=true')}>
                   Apply Now
                 </Button>
                 <Button size="lg" variant="ghost" className="text-white hover:bg-white/10" onClick={() => navigate('/contact')}>
                   Contact Support
                 </Button>
               </div>
             </div>
          </div>
        </Container>
      </Section>
    </div>
  );
};

export default ProviderGuideView;
