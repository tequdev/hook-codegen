import { useCallback, useEffect, useState } from "react";
import { CopyButton } from "./component/CopyButton";
import { abiToHookCode, type HookCode } from "./utils/abiToHookCode";
import type { ABI } from "./utils/types";

type GenerateCode = {
  id: string;
  code: HookCode;
};

type CodeType = "hookStates" | "hookParameters" | "otxnParameters";

function App() {
  const [inputJson, setInputJson] = useState("");
  const [generateCodes, setGenerateCodes] = useState<GenerateCode[]>([]);
  const [selectedTabId, setSelectedTabId] = useState<string | null>(null);
  const [selectedCodeType, setSelectedCodeType] = useState<CodeType | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = useCallback((value: string) => {
    setInputJson(value);
    if (!value.trim()) {
      setGenerateCodes([]);
      setSelectedTabId(null);
      setSelectedCodeType(null);
      setError(null);
      return;
    }

    try {
      const parsed = JSON.parse(value);

      const hooks = parsed.hooks;
      if (!hooks) {
        setError("Invalid JSON: No hooks field found");
        setGenerateCodes([]);
        setSelectedTabId(null);
        setSelectedCodeType(null);
        return;
      }

      if (hooks.some((hook: any) => !hook.abi)) {
        setError("Invalid JSON: Some hooks have no ABI");
        setGenerateCodes([]);
        setSelectedTabId(null);
        setSelectedCodeType(null);
        return;
      }

      const generatedCodes: GenerateCode[] = hooks.map((hook: any) => {
        return {
          id: hook.id,
          code: abiToHookCode(hook.abi as ABI),
        };
      });

      setGenerateCodes(generatedCodes);
      const firstHookId = generatedCodes[0]?.id ?? null;
      setSelectedTabId(firstHookId);

      if (firstHookId) {
        const firstCode = generatedCodes[0]?.code;
        const firstCodeType = firstCode?.hookStates
          ? "hookStates"
          : firstCode?.hookParameters
            ? "hookParameters"
            : firstCode?.otxnParameters
              ? "otxnParameters"
              : null;
        setSelectedCodeType(firstCodeType);
      } else {
        setSelectedCodeType(null);
      }

      setError(null);
    } catch (e) {
      setGenerateCodes([]);
      setSelectedTabId(null);
      setSelectedCodeType(null);
      setError(e instanceof Error ? e.message : "Invalid JSON");
    }
  }, []);

  const handleInputFormatOnBlur = useCallback((value: string) => {
    if (!value.trim()) {
      setGenerateCodes([]);
      setSelectedTabId(null);
      setSelectedCodeType(null);
      setError(null);
      return;
    }

    try {
      const parsed = JSON.parse(value);
      const formatted = JSON.stringify(parsed, null, 2);
      setInputJson(formatted);
      localStorage.setItem("inputJson", formatted);
      setError(null);
    } catch (e) {
      setInputJson(value);
      localStorage.setItem("inputJson", value);
      setError(e instanceof Error ? e.message : "Invalid JSON");
    }
  }, []);

  useEffect(() => {
    const json = localStorage.getItem("inputJson");
    if (json) {
      try {
        setInputJson(json);
        handleInputChange(json);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Invalid JSON");
      }
    }
  }, [handleInputChange]);

  return (
    <div className="container">
      <header className="header">
        <h1>hook-codegen</h1>
        <p className="subtitle">JSON Formatter</p>
      </header>

      <main className="main">
        <section className="panel">
          <div className="panel-header">
            <h2>Input</h2>
          </div>
          <textarea
            className="textarea"
            placeholder="Paste your JSON here..."
            value={inputJson}
            onChange={(e) => handleInputChange(e.target.value)}
            onBlur={(e) => handleInputFormatOnBlur(e.target.value)}
            spellCheck={false}
          />
          {error && <div className="error">{error}</div>}
        </section>

        <section className="panel">
          <div className="panel-header">
            <div className="header-tabs-container">
              <div className="tabs tabs-primary">
                {generateCodes.map((code) => (
                  <button
                    key={code.id}
                    type="button"
                    className={`tab tab-primary ${selectedTabId === code.id ? "active" : ""}`}
                    onClick={() => {
                      setSelectedTabId(code.id);
                      // hookが切り替わったら、最初の利用可能なcodeTypeを選択
                      const selectedCode = code.code;
                      const firstCodeType = selectedCode?.hookStates
                        ? "hookStates"
                        : selectedCode?.hookParameters
                          ? "hookParameters"
                          : selectedCode?.otxnParameters
                            ? "otxnParameters"
                            : null;
                      setSelectedCodeType(firstCodeType);
                    }}
                  >
                    {code.id}
                  </button>
                ))}
              </div>
              {selectedTabId && selectedCodeType && (
                <div className="tabs tabs-secondary">
                  {(() => {
                    const selectedCode = generateCodes.find(
                      (code) => code.id === selectedTabId
                    )?.code;
                    if (!selectedCode) return null;

                    const codeTypes: CodeType[] = [];
                    if (selectedCode.hookStates) codeTypes.push("hookStates");
                    if (selectedCode.hookParameters) codeTypes.push("hookParameters");
                    if (selectedCode.otxnParameters) codeTypes.push("otxnParameters");

                    return codeTypes.map((codeType) => (
                      <button
                        key={codeType}
                        type="button"
                        className={`tab tab-secondary ${
                          selectedCodeType === codeType ? "active" : ""
                        }`}
                        onClick={() => setSelectedCodeType(codeType)}
                      >
                        {codeType === "hookStates"
                          ? "Hook States"
                          : codeType === "hookParameters"
                            ? "Hook Parameters"
                            : "OTXN Parameters"}
                      </button>
                    ));
                  })()}
                </div>
              )}
            </div>
            {selectedTabId && selectedCodeType && (
              <CopyButton
                text={
                  generateCodes.find((code) => code.id === selectedTabId)?.code[selectedCodeType] ??
                  ""
                }
              />
            )}
          </div>
          <textarea
            className="textarea output"
            placeholder="Formatted JSON will appear here..."
            value={
              selectedTabId && selectedCodeType
                ? (generateCodes.find((code) => code.id === selectedTabId)?.code[
                    selectedCodeType
                  ] ?? "")
                : ""
            }
            readOnly
            spellCheck={false}
          />
        </section>
      </main>
    </div>
  );
}

export default App;
