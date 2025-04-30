import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { Card, CardHeader, CardContent, CardFooter } from '../../components/ui/Card';
import toast from 'react-hot-toast';

export default function NewClientPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    billing_address: '',
    street_address: '',
    city: '',
    state: '',
    zip: '',
    notes: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('clients').insert([formData]);
    if (error) {
      toast.error('Failed to add client');
      console.error(error);
    } else {
      toast.success('Client added successfully');
      navigate('/clients');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader title="New Client" subtitle="Fill out the details to create a client record." />
        <form onSubmit={handleSubmit}>
          <CardContent className="grid grid-cols-1 gap-4">
            <Input
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <Input label="Phone" name="phone" value={formData.phone} onChange={handleChange} />
            <Input
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
            />
            <Input
              label="Billing Address"
              name="billing_address"
              value={formData.billing_address}
              onChange={handleChange}
            />
            <Input
              label="Street Address"
              name="street_address"
              value={formData.street_address}
              onChange={handleChange}
            />
            <Input label="City" name="city" value={formData.city} onChange={handleChange} />
            <Input label="State" name="state" value={formData.state} onChange={handleChange} />
            <Input label="Zip Code" name="zip" value={formData.zip} onChange={handleChange} />
            <Input label="Notes" name="notes" value={formData.notes} onChange={handleChange} />
          </CardContent>
          <CardFooter>
            <Button type="submit" variant="primary" fullWidth>
              Save Client
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
