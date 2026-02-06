import React from 'react';
import { Section, Container, Grid } from '../components/layout';
import { Heading, Text, Label } from '../components/typography';
import { Card, CardHeader, CardBody } from '../components/ui';

const DocumentationView: React.FC = () => {
  return (
    <div className="bg-[#F8F7F5] min-h-screen py-12 pt-32">
      <Container size="narrow">
        <Card className="mb-10 text-center">
          <Heading level={1} className="mb-4">Technical Architecture</Heading>
          <Text variant="lead" className="italic">EvoWell Phase 1 — Infrastructure Specifications</Text>
        </Card>

        <div className="space-y-10">
          <Card>
            <Label variant="overline" color="brand" className="mb-8">1. Domain Schema</Label>
            <Grid cols={2} gap="md">
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                <Label variant="badge" className="mb-2">Identity Hub</Label>
                <Text variant="small" color="muted">HUB_UID, Email Protocol, RBAC (Visitor/Client/Provider/Admin), Audit Fields</Text>
              </div>
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                <Label variant="badge" className="mb-2">Clinical Index</Label>
                <Text variant="small" color="muted">Specialist_PID, Verification_Status, Subscription_Tier, Session_Encrypted_Link</Text>
              </div>
            </Grid>
          </Card>

          <Card>
            <Label variant="overline" color="brand" className="mb-8">2. Secure Endpoints</Label>
            <div className="overflow-hidden rounded-2xl border border-slate-100">
              <table className="min-w-full divide-y divide-slate-100">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocol</th>
                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Namespace</th>
                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Visibility</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  <tr><td className="px-6 py-4 font-bold text-blue-600">POST</td><td className="px-6 py-4 font-medium text-slate-700">/api/v1/auth/secure</td><td className="px-6 py-4 text-slate-400">Public</td></tr>
                  <tr><td className="px-6 py-4 font-bold text-blue-600">PATCH</td><td className="px-6 py-4 font-medium text-slate-700">/api/v1/clinical/vetting</td><td className="px-6 py-4 text-blue-500 font-black">Admin</td></tr>
                </tbody>
              </table>
            </div>
          </Card>

          <Card className="bg-slate-900 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[100px]"></div>
            <CardHeader>
               <Heading level={2} color="white" className="mb-6">Clinical Sovereignity</Heading>
            </CardHeader>
            <CardBody>
               <Text color="white" className="mb-8 opacity-80">EvoWell is engineered for Zero-Trust clinical connections. Every data pathway is HIPAA-aligned by design.</Text>
               <Grid cols={2} gap="md">
                 <div className="bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-md">
                   <Label variant="overline" className="mb-1 text-blue-400">Encryption</Label>
                   <Text variant="small" color="white">AES-256 Hub Secure</Text>
                 </div>
                 <div className="bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-md">
                   <Label variant="overline" className="mb-1 text-blue-400">Integrity</Label>
                   <Text variant="small" color="white">Manual Clinical Vetting</Text>
                 </div>
               </Grid>
            </CardBody>
          </Card>
        </div>
      </Container>
    </div>
  );
};

export default DocumentationView;