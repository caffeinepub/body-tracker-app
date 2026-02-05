import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useSaveCallerUserProfile } from '../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LogOut, Save, User } from 'lucide-react';
import { toast } from 'sonner';
import type { UserProfile, Gender, Units } from '../backend';
import { Variant_kg_lbs, Variant_cm_inches } from '../backend';

export default function ProfileView() {
  const { clear, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { data: userProfile } = useGetCallerUserProfile();
  const saveMutation = useSaveCallerUserProfile();

  const [name, setName] = useState(userProfile?.name || '');
  const [age, setAge] = useState(userProfile?.age.toString() || '');
  const [gender, setGender] = useState<string>(
    userProfile?.gender.__kind__ === 'male'
      ? 'male'
      : userProfile?.gender.__kind__ === 'female'
      ? 'female'
      : 'other'
  );
  const [weightUnit, setWeightUnit] = useState<string>(
    userProfile?.units.weight === Variant_kg_lbs.kg ? 'kg' : 'lbs'
  );
  const [measurementUnit, setMeasurementUnit] = useState<string>(
    userProfile?.units.measurements === Variant_cm_inches.cm ? 'cm' : 'inches'
  );

  const handleSave = async () => {
    if (!name || !age) {
      toast.error('Please fill in all required fields');
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
        age: BigInt(age),
        gender: genderValue,
        units,
      };

      await saveMutation.mutateAsync(profile);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    toast.success('Logged out successfully');
  };

  return (
    <div className="h-full overflow-auto">
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <h2 className="mb-6 text-3xl font-bold text-foreground">Profile Settings</h2>

        <Card className="mb-6 p-6">
          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white">
              <User className="h-10 w-10" />
            </div>
            <div>
              <h3 className="text-xl font-semibold">{name || 'Your Name'}</h3>
              <p className="text-sm text-muted-foreground">
                {identity?.getPrincipal().toString().slice(0, 20)}...
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="mb-1.5 block">Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
              />
            </div>

            <div>
              <Label htmlFor="age" className="mb-1.5 block">Age *</Label>
              <Input
                id="age"
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Enter your age"
              />
            </div>

            <div>
              <Label htmlFor="gender" className="mb-1.5 block">Gender</Label>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger id="gender">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="weightUnit" className="mb-1.5 block">Weight Unit</Label>
                <Select value={weightUnit} onValueChange={setWeightUnit}>
                  <SelectTrigger id="weightUnit">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">kg</SelectItem>
                    <SelectItem value="lbs">lbs</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="measurementUnit" className="mb-1.5 block">Measurement Unit</Label>
                <Select value={measurementUnit} onValueChange={setMeasurementUnit}>
                  <SelectTrigger id="measurementUnit">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cm">cm</SelectItem>
                    <SelectItem value="inches">in</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="mt-6 flex gap-2">
            <Button
              onClick={handleSave}
              disabled={saveMutation.isPending}
              className="flex-1 gap-2"
            >
              <Save className="h-4 w-4" />
              {saveMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold">Account Actions</h3>
          <Button
            onClick={handleLogout}
            variant="destructive"
            className="w-full gap-2"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </Card>
      </div>
    </div>
  );
}
