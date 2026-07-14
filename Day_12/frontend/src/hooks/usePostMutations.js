// src/hooks/usePostMutations.js
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';

const API_URL = 'http://localhost:3001/api/posts';

export const usePostMutations = () => {
  const queryClient = useQueryClient();

  const onSuccess = (msg) => {
    message.success(msg);
    // This tells React Query to refetch the GET api/posts route, updating the UI
    queryClient.invalidateQueries({ queryKey: ['posts'] }); 
  };

  const onError = (err) => message.error(err.message || 'Something went wrong');

  const createMutation = useMutation({
    mutationFn: async (newPost) => { // FIXED: Changed from queryFn to mutationFn
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPost),
      });
      return res.json();
    },
    onSuccess: () => onSuccess('Post created successfully!'),
    onError,
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => { // FIXED: Changed from queryFn to mutationFn
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Cannot edit external posts!');
      return res.json();
    },
    onSuccess: () => onSuccess('Post updated!'),
    onError,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => { // FIXED: Changed from queryFn to mutationFn
      const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Cannot delete external posts!');
      return res.json();
    },
    onSuccess: () => onSuccess('Post deleted!'),
    onError,
  });

  return { createMutation, updateMutation, deleteMutation };
};