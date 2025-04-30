import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Search, Pencil, Trash2, ClipboardList } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatDate } from '../../lib/utils';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import toast from 'react-hot-toast';

const ClientsPage = () => {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    street_address: '',
  });

  // Fetch clients from Supabase
  async function fetchClients() {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('name', { ascending: sortOrder === 'asc' });
      if (error) throw error;
      setClients(data || []);
    } catch (err) {
      console.error('Error fetching clients:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchClients();
  }, [sortOrder]);

  // Start editing
  function handleEdit(client: any) {
    setEditingId(client.id);
    setEditForm({
      name: client.name,
      email: client.email,
      phone: client.phone,
      street_address: client.street_address,
    });
  }

  // Save edits
  async function handleSave(id: string) {
    const { error } = await supabase.from('clients').update(editForm).eq('id', id);
    if (error) {
      toast.error('Failed to update');
    } else {
      toast.success('Updated successfully');
      setEditingId(null);
      fetchClients();
    }
  }

  // Perform the delete
  async function deleteClient(id: string) {
    const { error } = await supabase.from('clients').delete().eq('id', id);
    if (error) toast.error('Failed to delete');
    else {
      toast.success('Client deleted');
      fetchClients();
    }
  }

  // Show a custom toast confirmation
  function showDeleteToast(id: string) {
    toast.custom(
      (t) => (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50 p-4">
          <div className="bg-white shadow-lg rounded-lg p-4 sm:p-6 w-full max-w-sm sm:max-w-md flex flex-col items-center space-y-4">
            <p className="text-base sm:text-lg font-medium text-center">Delete this client?</p>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 w-full">
              <button
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 w-full sm:w-auto"
                onClick={() => {
                  deleteClient(id);
                  toast.dismiss(t.id);
                }}
              >
                Delete
              </button>
              <button
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 w-full sm:w-auto"
                onClick={() => toast.dismiss(t.id)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ),
      { duration: Infinity }
    );
  }

  // Filter by search
  const filteredClients = clients.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.street_address?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
        <div className="flex items-center gap-2">
          <User className="h-5 w-5 sm:h-6 sm:w-6" />
          <h1 className="text-xl sm:text-2xl font-bold">Clients</h1>
        </div>
        <Link to="/clients/new">
          <Button variant="primary" size="sm" className="w-full sm:w-auto">
            New Client
          </Button>
        </Link>
      </div>

      {/* Search & Sort */}
      <Card className="mb-6">
        <CardHeader title="Search & Sort" />
        <CardContent>
          <div className="flex flex-col space-y-4 sm:grid sm:grid-cols-2 sm:gap-4 sm:space-y-0">
            {/* Search input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name or street..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
            </div>
            {/* Sort dropdown */}
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
              className="border border-gray-300 rounded-lg py-2 px-4 focus:ring-blue-500 text-sm sm:text-base"
            >
              <option value="asc">Sort A–Z</option>
              <option value="desc">Sort Z–A</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Loading / No results */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600 rounded-full mx-auto" />
          <p className="mt-4 text-gray-600 text-sm sm:text-base">Loading clients...</p>
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="text-center py-8">
          <User className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-sm sm:text-base">No clients found</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow md:overflow-hidden">
          {/* Table for medium screens and up */}
          <table className="hidden md:table min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Address</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Added</th>
                <th className="px-4 sm:px-6 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map((client) => (
                <tr key={client.id} className="border-t">
                  {/* Name */}
                  <td className="px-4 sm:px-6 py-3 font-medium">
                    {editingId === client.id ? (
                      <Input
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="text-sm"
                      />
                    ) : (
                      client.name
                    )}
                  </td>
                  {/* Email */}
                  <td className="px-4 sm:px-6 py-3">
                    {editingId === client.id ? (
                      <Input
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        className="text-sm"
                      />
                    ) : (
                      client.email
                    )}
                  </td>
                  {/* Phone */}
                  <td className="px-4 sm:px-6 py-3">
                    {editingId === client.id ? (
                      <Input
                        value={editForm.phone}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        className="text-sm"
                      />
                    ) : (
                      client.phone
                    )}
                  </td>
                  {/* Address */}
                  <td className="px-4 sm:px-6 py-3">
                    {editingId === client.id ? (
                      <Input
                        value={editForm.street_address}
                        onChange={(e) => setEditForm({ ...editForm, street_address: e.target.value })}
                        className="text-sm"
                      />
                    ) : (
                      `${client.street_address}, ${client.city}, ${client.state} ${client.zip}`
                    )}
                  </td>
                  {/* Added */}
                  <td className="px-4 sm:px-6 py-3 text-gray-500">
                    {formatDate(new Date(client.created_at), 'MMM d, yyyy')}
                  </td>
                  {/* Actions */}
                  <td className="px-4 sm:px-6 py-3 text-right flex items-center gap-2">
                    <Link to={`/jobs/new?client_id=${client.id}`}>
                      <ClipboardList className="h-4 w-4 text-green-600 hover:text-green-800 cursor-pointer" />
                    </Link>
                    {editingId === client.id ? (
                      <Button size="sm" onClick={() => handleSave(client.id)}>
                        Save
                      </Button>
                    ) : (
 <>
                        <Pencil
                          className="h-4 w-4 text-blue-600 hover:text-blue-800 cursor-pointer"
                          onClick={() => handleEdit(client)}
                        />
                        <Trash2
                          className="h-4 w-4 text-red-600 hover:text-red-800 cursor-pointer"
                          onClick={() => showDeleteToast(client.id)}
                        />
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Card layout for mobile */}
          <div className="md:hidden divide-y divide-gray-200">
            {filteredClients.map((client) => (
              <div key={client.id} className="p-4 space-y-3">
                <div>
                  <div className="font-medium text-base">
                    {editingId === client.id ? (
                      <Input
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="text-sm"
                      />
                    ) : (
                      client.name
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    Added: {formatDate(new Date(client.created_at), 'MMM d, yyyy')}
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <div>
                    <label className="text-xs font-medium text-gray-500">Email</label>
                    {editingId === client.id ? (
                      <Input
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        className="text-sm"
                      />
                    ) : (
                      <p className="text-sm">{client.email}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500">Phone</label>
                    {editingId === client.id ? (
                      <Input
                        value={editForm.phone}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        className="text-sm"
                      />
                    ) : (
                      <p className="text-sm">{client.phone}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500">Address</label>
                    {editingId === client.id ? (
                      <Input
                        value={editForm.street_address}
                        onChange={(e) => setEditForm({ ...editForm, street_address: e.target.value })}
                        className="text-sm"
                      />
                    ) : (
                      <p className="text-sm">{`${client.street_address}, ${client.city}, ${client.state} ${client.zip}`}</p>
                    )}
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Link to={`/jobs/new?client_id=${client.id}`}>
                    <ClipboardList className="h-5 w-5 text-green-600 hover:text-green-800 cursor-pointer" />
                  </Link>
                  {editingId === client.id ? (
                    <Button size="sm" onClick={() => handleSave(client.id)}>
                      Save
                    </Button>
                  ) : (
                    <>
                      <Pencil
                        className="h-5 w-5 text-blue-600 hover:text-blue-800 cursor-pointer"
                        onClick={() => handleEdit(client)}
                      />
                      <Trash2
                        className="h-5 w-5 text-red-600 hover:text-red-800 cursor-pointer"
                        onClick={() => showDeleteToast(client.id)}
                      />
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientsPage;