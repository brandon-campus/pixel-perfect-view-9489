import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export function useFavorites() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: favorites = [] } = useQuery({
    queryKey: ['favorites', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase.from('lugares_guardados').select('lugar_id').eq('usuario_id', user.id);
      if (error) {
        console.error("Error fetching favorites:", error);
        return [];
      }
      return data?.map(d => d.lugar_id) || [];
    },
    enabled: !!user,
  });

  const toggleFavorite = useMutation({
    mutationFn: async (lugar_id: string) => {
      if (!user) throw new Error("Debes iniciar sesión para guardar favoritos.");
      const isFav = favorites.includes(lugar_id);
      if (isFav) {
        const { error } = await supabase.from('lugares_guardados').delete().eq('usuario_id', user.id).eq('lugar_id', lugar_id);
        if (error) throw error;
        return { lugar_id, action: 'removed' };
      } else {
        const { error } = await supabase.from('lugares_guardados').insert({ usuario_id: user.id, lugar_id });
        if (error) throw error;
        return { lugar_id, action: 'added' };
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['favorites', user?.id] });
      toast.success(result.action === 'added' ? 'Guardado en favoritos' : 'Eliminado de favoritos');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Ocurrió un error al guardar el favorito.');
    },
  });

  return { favorites, toggleFavorite };
}
