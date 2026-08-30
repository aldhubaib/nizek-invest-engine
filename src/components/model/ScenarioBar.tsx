import { useState } from "react";
import { useModel } from "@/model/context";
import { multiple, percent } from "@/model/format";

export function ScenarioBar() {
  const { scenarios, activeScenario, loadScenario, reset, saveScenario, isCustom, projection } =
    useModel();
  const [naming, setNaming] = useState(false);
  const [name, setName] = useState("");

  return (
    <div className="flex flex-wrap items-center justify-between gap-6 border-b border-border px-6 py-5 md:px-12">
      <div className="flex flex-wrap items-center gap-6">
        <span className="label-xs">Scenario</span>
        <div className="flex flex-wrap items-center gap-4">
          {scenarios.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => loadScenario(s.id)}
              className={`text-sm transition-colors ${
                !isCustom && activeScenario === s.id
                  ? "text-foreground underline underline-offset-8"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {s.name}
            </button>
          ))}
          {isCustom && <span className="text-sm text-foreground underline underline-offset-8">Custom</span>}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-8">
        <span className="num text-sm text-muted-foreground">
          MOIC {multiple(projection.returns.moic)} · IRR{" "}
          {Number.isFinite(projection.returns.irr) ? percent(projection.returns.irr, 0) : "n/a"}
        </span>
        {naming ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (name.trim()) saveScenario(name.trim());
              setName("");
              setNaming(false);
            }}
            className="flex items-center gap-3"
          >
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Scenario name"
              className="num border-b border-border-strong bg-transparent pb-1 text-sm outline-none placeholder:text-subtle"
            />
            <button type="submit" className="label-xs hover:text-foreground">
              Save
            </button>
          </form>
        ) : (
          <button type="button" onClick={() => setNaming(true)} className="label-xs hover:text-foreground">
            Save scenario
          </button>
        )}
        <button type="button" onClick={reset} className="label-xs hover:text-foreground">
          Reset
        </button>
      </div>
    </div>
  );
}
