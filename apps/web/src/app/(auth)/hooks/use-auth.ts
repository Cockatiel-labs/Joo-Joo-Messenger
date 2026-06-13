import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

export function useCheckUsernameQuery(usernameQuery: string) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["check-username", usernameQuery],
    queryFn: async () => {
      const response = await api.get("/v1/auth/check-username", {
        params: {
          username: usernameQuery,
        },
      });

      return response.data;
    },

    retry: false,
    enabled: usernameQuery.length >= 3,
  });

  return { data, isLoading, isError };
}
