import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/common/Card';

export const Emergency: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <h2 className="text-3xl font-extrabold text-danger mb-6">Emergency SOS Services</h2>
      <Card className="border-danger/30">
        <CardHeader>
          <CardTitle className="text-danger">Active Dispatcher Panel</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-500">This feature will be fully implemented in Phase 15. In emergencies, clicking the primary SOS button will immediately request coordinates, highlight local hospital maps, and show active blood inventories.</p>
        </CardContent>
      </Card>
    </div>
  );
};
