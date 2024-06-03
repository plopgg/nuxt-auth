import { useTypedBackendConfig } from "../helpers.mjs";
import { useRuntimeConfig } from "#imports";
export const formatToken = (token) => {
  const config = useTypedBackendConfig(useRuntimeConfig(), "local");
  if (token === null) {
    return null;
  }
  return config.token.type.length > 0 ? `${config.token.type} ${token}` : token;
};
