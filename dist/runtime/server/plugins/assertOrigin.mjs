import { ERROR_MESSAGES } from "../services/errors.mjs";
import { isProduction } from "../../helpers.mjs";
import { getServerOrigin } from "../services/utils.mjs";
function defineNitroPlugin(def) {
  return def;
}
export default defineNitroPlugin(() => {
  try {
    getServerOrigin();
  } catch (error) {
    if (!isProduction) {
      console.info(ERROR_MESSAGES.NO_ORIGIN);
    } else {
      throw error;
    }
  }
});
