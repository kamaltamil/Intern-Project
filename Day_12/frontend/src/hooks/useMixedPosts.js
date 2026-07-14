import { useQuery } from '@tanstack/react-query';

const fetchPosts = async () => {
  const response = await fetch('http://localhost:3001/api/posts');
  if (!response.ok) throw new Error('Network response was not ok');
  return response.json();
};

export const useMixedPosts = () => {
  return useQuery({
    queryKey: ['posts'],
    queryFn: fetchPosts,
  });
};