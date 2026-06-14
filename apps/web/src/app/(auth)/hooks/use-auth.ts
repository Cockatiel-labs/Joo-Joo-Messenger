import type { SigninInput, SignupInput } from "@cockatiel/shared/schemas/auth/auth.schema";
import { useMutation, useQuery } from "@tanstack/react-query";
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

export function useSigninMutate() {
  const { mutate, isPending, isError } = useMutation({
    mutationKey: ["auth", "sign-in"],
    mutationFn: async (payload: SigninInput) => {
      const response = await api.post("/v1/auth/sign-in", payload);

      return response.data;
    },
    onSuccess: (data) => {
      console.log(data);
    },
    onError: () => {
      console.error(`something went wrong`);
    },
  });

  return { mutate, isPending, isError };
}

export function useSignupMutate() {
  const { mutate, isPending, isError } = useMutation({
    mutationKey: ["auth", "sign-up"],
    mutationFn: async (payload: SignupInput) => {
      const response = await api.post("/v1/auth/sign-up", payload);

      return response.data;
    },
    onSuccess: (data) => {
      console.log(data);
    },
    onError: () => {
      console.error(`something went wrong`);
    },
  });

  return { mutate, isPending, isError };
}
