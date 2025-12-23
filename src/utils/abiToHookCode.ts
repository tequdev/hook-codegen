import { generateHookParametersCode } from "./generators/hookParameter";
import { generateHookStatesCode } from "./generators/hookState";
import { generateOtxnParametersCode } from "./generators/otxnParameter";
import type { ABI } from "./types";

export type HookCode = {
  hookStates?: string;
  hookParameters?: string;
  otxnParameters?: string;
};

export const abiToHookCode = (abi: ABI): HookCode => {
  const hookStates = abi.hookStates;
  const hookParameters = abi.hookParameters;
  const otxnParameters = abi.otxnParameters;

  const code: HookCode = {};
  if (hookStates) {
    code.hookStates = generateHookStatesCode(hookStates);
  }
  if (hookParameters) {
    code.hookParameters = generateHookParametersCode(hookParameters);
  }
  if (otxnParameters) {
    code.otxnParameters = generateOtxnParametersCode(otxnParameters);
  }
  return code;
};
