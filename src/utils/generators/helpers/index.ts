import type { Field, HookState, Parameter } from "../../types";

export const defineStructCodeFromFields = (structName: string, fields: Field[]) => {
  const cTypeFields = fields
    .map((field) => {
      return `  ${convertFieldTypeToCType(field)};`;
    })
    .join("\n");
  return `
typedef struct ${structName} {
${cTypeFields}
} ${structName};`;
};

/*
  Example:
  struct ABC abc = {
      .a = 1,
      .b = 2,
  };
*/
export const initializeStructCodeFromFields = (
  structName: string,
  fields: Field[],
  onlyVar: boolean = false
) => {
  const cTypeFields = fields
    .filter((field) => field.pattern)
    .map((field) => {
      return `  .${field.label ?? field.type} = ${toInitializeValue(field)},`;
    });

  if (onlyVar || cTypeFields.length === 0) {
    return `
${structName} ${structName.toLowerCase()};`;
  }

  return `
${structName} ${structName.toLowerCase()} = {
${cTypeFields.join("\n")}
};`;
};

const convertFieldTypeToCType = (field: Field) => {
  const label = field.label ?? field.type;
  switch (field.type) {
    case "UInt8":
      return `uint8_t ${label}`;
    case "UInt16":
      return `uint16_t ${label}`;
    case "UInt32":
      return `uint32_t ${label}`;
    case "UInt64":
      return `uint64_t ${label}`;
    case "AccountID":
      return `uint8_t ${label}[20]`;
    case "Hash128":
      return `uint8_t ${label}[16]`;
    case "Hash160":
      return `uint8_t ${label}[20]`;
    case "Hash256":
      return `uint8_t ${label}[32]`;
    case "Amount":
      return `uint8_t ${label}[48]`;
    case "VarString":
      if (field.byteLength) return `uint8_t ${label}[${field.byteLength}]`;
      return `uint8_t ${label}[256] // Set 256 as a placeholder value. Should be set with byteLength in ABI`;
    case "Null":
      if (typeof field.byteLength === "undefined")
        throw new Error(`Byte length is required for Null field: ${label}`);
      return `uint8_t _offset[${field.byteLength}]`;
    default:
      throw new Error(`Unsupported field type: ${label}`);
  }
};

const toInitializeValue = (field: Field) => {
  const type = field.type;
  const pattern = field.pattern;
  const patternEncoding = field.patternEncoding || "hex";
  if (!pattern) throw new Error(`Pattern is required for field: ${field.label ?? field.type}`);
  switch (type) {
    case "UInt8":
    case "UInt16":
    case "UInt32":
    case "UInt64":
      return pattern;
    case "AccountID":
      return `"${pattern}"`;
    case "Hash128":
      return `"${pattern}"`;
    case "Hash160":
      return `"${pattern}"`;
    case "Hash256":
      return `"${pattern}"`;
    case "Amount":
      throw new Error(`Amount field does not supported now: ${pattern}`);
    case "VarString": {
      // if patternEncoding == 'hex' -> "BEEF" -> {0xBE, 0xEF}
      if (patternEncoding === "hex")
        return `{ ${(
          pattern.match(/.{1,2}/g)?.map((byte) => {
            return `0x${byte.toUpperCase()}U`;
          }) ?? []
        ).join(", ")} }`;
      // if patternEncoding == 'ascii' -> "BEEF" -> {0x42, 0x45, 0x45, 0x46}
      if (patternEncoding === "ascii")
        return `{ ${pattern
          .split("")
          .map((char) => {
            return `'${char}'`;
          })
          .join(", ")} }`;
      throw new Error(`Unsupported pattern encoding: ${patternEncoding}`);
    }
    case "Null":
      throw new Error(`Null field should not have a pattern: ${field.label ?? field.type}`);
    default:
      throw new Error(`Unsupported field type: ${type}`);
  }
};

export const fillLabel = <T extends Parameter | HookState>(target: T): T => {
  return {
    ...target,
    selector: target.selector.map((field, index) => {
      return {
        ...field,
        label: field.label ?? `field_${index}`,
      };
    }),
    data: target.data.map((field, index) => {
      return {
        ...field,
        label: field.label ?? `field_${index}`,
      };
    }),
  };
};

export const ucfirst = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};
