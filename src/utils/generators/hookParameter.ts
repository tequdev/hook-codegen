import type { Parameter } from "../types";
import {
  defineStructCodeFromFields,
  fillLabel,
  initializeStructCodeFromFields,
  ucfirst,
} from "./helpers";

export const generateHookParametersCode = (hookParameters: Parameter[]) => {
  return hookParameters.map(fillLabel).map(generateHookParameterCode).join("\n");
};

const generateHookParameterCode = (hookParameter: Parameter) => {
  const { name, description, selector, data } = hookParameter;
  const structKey = `${ucfirst(name)}Key`;
  const structData = `${ucfirst(name)}Data`;

  if (selector.length === 1 && selector[0].type === "VarString" && selector[0].pattern) {
    // Direct Key str
    return `
// name: ${name || ""}
// description: ${description || ""}
${defineStructCodeFromFields(structData, data).replace(/^\n/, "")}
${initializeStructCodeFromFields(structData, data, true)}
hook_param(SBUF("${selector[0].pattern}"), SBUF(&${structKey.toLowerCase()}));
`.replace(/^\n/, "");
  }

  return `
// name: ${name || ""}
// description: ${description || ""}
${defineStructCodeFromFields(structKey, selector).replace(/^\n/, "")}
${defineStructCodeFromFields(structData, data)}
${initializeStructCodeFromFields(structKey, selector)}
${initializeStructCodeFromFields(structData, data, true)}
hook_param(SBUF(&${structData.toLowerCase()}), SBUF(&${structKey.toLowerCase()}));
`.replace(/^\n/, "");
};
