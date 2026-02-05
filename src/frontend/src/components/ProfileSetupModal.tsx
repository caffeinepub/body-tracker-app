import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSaveCallerUserProfile } from '../hooks/useQueries';
import { toast } from 'sonner';
import type { UserProfile, Gender, Units } from '../backend';
import { Variant_kg_lbs, Variant_cm_inches } from '../backend';

export default function ProfileSetupModal() {
  const saveMutation = useSaveCallerUserProfile();
  const [name, setName] = useState('');
  const [gender, setGender] = useState<string>('male');
  const [weightUnit, setWeightUnit] = useState<string>('kg');
  const [measurementUnit, setMeasurementUnit] = useState<string>('cm');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name) {
      toast.error('Please enter your name');
      return;
    }

    try {
      const genderValue: Gender =
        gender === 'male'
          ? { __kind__: 'male', male: null }
          : gender === 'female'
          ? { __kind__: 'female', female: null }
          : { __kind__: 'other', other: 'Other' };

      const units: Units = {
        weight: weightUnit === 'kg' ? Variant_kg_lbs.kg : Variant_kg_lbs.lbs,
        measurements: measurementUnit === 'cm' ? Variant_cm_inches.cm : Variant_cm_inches.inches,
      };

      const profile: UserProfile = {
        name,
        age: BigInt(0),
        gender: genderValue,
        units,
      };

      await saveMutation.mutateAsync(profile);
      toast.success('Profile created successfully!');
    } catch (error) {
      toast.error('Failed to create profile');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-md p-6">
        <h2 className="mb-6 text-2xl font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Welcome to physiq!
        </h2>
        <p className="mb-6 text-center text-muted-foreground">
          Let's set up your profile to get started
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="setup-name">Name *</Label>
            <Input
              id="setup-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="setup-gender">Gender</Label>
            <Select value={gender} onValueChange={setGender}>
              <SelectTrigger id="setup-gender">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="setup-weight">Weight Unit</Label>
              <Select value={weightUnit} onValueChange={setWeightUnit}>
                <SelectTrigger id="setup-weight">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">kg</SelectItem>
                  <SelectItem value="lbs">lbs</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="setup-measurement">Measurements</Label>
              <Select value={measurementUnit} onValueChange={setMeasurementUnit}>
                <SelectTrigger id="setup-measurement">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cm">cm</SelectItem>
                  <SelectItem value="inches">in</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={saveMutation.isPending}
          >
            {saveMutation.isPending ? 'Creating Profile...' : 'Get Started'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
