import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { discsApi } from '../api/discs';
import { PageWrapper } from '../components/layout/PageWrapper';
import { DiscCard } from '../components/discs/DiscCard';
import { DiscForm } from '../components/discs/DiscForm';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { PageSpinner } from '../components/ui/Spinner';
import type { Disc, CreateDiscInput } from '../../../shared/src/types';

export function BagPage() {
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDisc, setEditingDisc] = useState<Disc | null>(null);

  const { data: discs = [], isLoading } = useQuery({
    queryKey: ['discs'],
    queryFn: discsApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: discsApi.create,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['discs'] }); setShowAddModal(false); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateDiscInput> }) => discsApi.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['discs'] }); setEditingDisc(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: discsApi.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['discs'] }),
  });

  if (isLoading) return <PageWrapper title="My Bag"><PageSpinner /></PageWrapper>;

  return (
    <PageWrapper
      title="My Bag"
      action={<Button onClick={() => setShowAddModal(true)}>+ Add Disc</Button>}
    >
      {discs.length === 0 ? (
        <Card className="p-10 text-center">
          <div className="text-4xl mb-3">🥏</div>
          <h3 className="font-medium text-stone-700 mb-1">Your bag is empty</h3>
          <p className="text-sm text-stone-500 mb-4">Add your discs to track your bag.</p>
          <Button onClick={() => setShowAddModal(true)}>Add Your First Disc</Button>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {discs.map(disc => (
            <DiscCard
              key={disc.id}
              disc={disc}
              onEdit={() => setEditingDisc(disc)}
              onDelete={() => { if (confirm(`Remove ${disc.name}?`)) deleteMutation.mutate(disc.id); }}
            />
          ))}
        </div>
      )}

      {/* Add Modal */}
      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="Add Disc to Bag">
        <DiscForm
          onSubmit={async (data) => { await createMutation.mutateAsync(data); }}
          onCancel={() => setShowAddModal(false)}
          isLoading={createMutation.isPending}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal open={!!editingDisc} onClose={() => setEditingDisc(null)} title="Edit Disc">
        {editingDisc && (
          <DiscForm
            defaultValues={editingDisc}
            onSubmit={async (data) => { await updateMutation.mutateAsync({ id: editingDisc.id, data }); }}
            onCancel={() => setEditingDisc(null)}
            isLoading={updateMutation.isPending}
          />
        )}
      </Modal>
    </PageWrapper>
  );
}
