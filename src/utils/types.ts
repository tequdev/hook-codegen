interface FieldBase {
  type: string;
  label?: string;
  description?: string;
  // byteLength: number for Null/VarString
  pattern?: string;
  patternEncoding: "ascii" | "hex"; // default: hex
  exclude?: boolean;
  // endianness: 'BE' | 'LE for numeric fields
  // min?: number for numeric fields
  // max?: number for numeric fields
  // decodeAs?: 'unixTime' | 'ledgerIndex' | 'percentage' | 'drops' | 'seconds' | 'none'
  // repeat?: number Fixed array size
  // repeatDescription?: string
  // delimiter?: string
  // enumValues: object
  notes?: string;
  // items: [] // required for Array,STObject, STArray, Vector256
}

interface NumericField extends FieldBase {
  type:
    | "UInt8"
    | "UInt16"
    | "UInt32"
    | "UInt64"
    | "UInt128"
    | "UInt160"
    | "UInt256"
    | "UInt512"
    | "Int8"
    | "Int16"
    | "Int32"
    | "Int64";
  endianness?: "BE" | "LE"; // default 'BE'
  min?: number;
  max?: number;
}

export interface Uint8Field extends NumericField {
  type: "UInt8";
}

export interface Uint16Field extends NumericField {
  type: "UInt16";
}

export interface Uint32Field extends NumericField {
  type: "UInt32";
}

export interface Uint64Field extends NumericField {
  type: "UInt64";
}

// export interface Uint128Field extends NumericField {
//   type: 'UInt128'
// }

// export interface Uint160Field extends NumericField {
//   type: 'UInt160'
// }

// export interface Uint256Field extends NumericField {
//   type: 'UInt256'
// }

// export interface Uint512Field extends NumericField {
//   type: 'UInt512'
// }

export interface AccountIDField extends FieldBase {
  type: "AccountID";
}

export interface Hash128Field extends FieldBase {
  type: "Hash128";
}

export interface Hash160Field extends FieldBase {
  type: "Hash160";
}

export interface Hash256Field extends FieldBase {
  type: "Hash256";
}

export interface AmountField extends FieldBase {
  type: "Amount";
}

export interface VarStringField extends FieldBase {
  type: "VarString";
  byteLength: number;
}

export interface NullField extends FieldBase {
  type: "Null";
  byteLength: number;
}

export type Field =
  | Uint8Field
  | Uint16Field
  | Uint32Field
  | Uint64Field
  | AccountIDField
  | Hash128Field
  | Hash160Field
  | Hash256Field
  | AmountField
  | VarStringField
  | NullField;

export interface Parameter {
  name: string;
  description?: string;
  selector: Field[];
  data: Field[];
  notes?: string;
  deprecated?: boolean;
}

export interface HookState {
  name: string;
  description?: string;
  selector: Field[];
  data: Field[];
  notes?: string;
  deprecated?: boolean;
}

export interface ABI {
  notes?: string;
  hookParameters?: Parameter[];
  otxnParameters?: Parameter[];
  hookStates?: HookState[];
  // foreignStates: HookState[]
}
