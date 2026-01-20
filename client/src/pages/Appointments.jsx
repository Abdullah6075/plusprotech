import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Calendar } from 'lucide-react';

/**
 * Appointments Page
 * Simple page with appointment title field (to be expanded later)
 */
const Appointments = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
        <p className="text-muted-foreground">Manage your appointments</p>
      </div>

      {/* Appointment Form Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            <CardTitle>Create Appointment</CardTitle>
          </div>
          <CardDescription>
            Fill in the appointment details below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="appointmentTitle">
                Appointment Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="appointmentTitle"
                name="appointmentTitle"
                type="text"
                placeholder="Enter appointment title"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Appointments;
