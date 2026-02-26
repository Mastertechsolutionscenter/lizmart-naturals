import { useFieldArray, useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect } from "react";
import { defaultOptions } from "@/lib/defaultOptions";

export function ProductOptionsForm() {
  const { control, register, setValue, watch } = useFormContext();

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "options",
  });

  const options = watch("options");

  // ✅ Prefill all default options in one call
  useEffect(() => {
    if (!options || options.length === 0) {
      replace(defaultOptions); // 🔑 replace instead of append to set all at once
    }
  }, [options, replace]);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Product Options</h3>
      {fields.map((field, index) => {
        const currentValues = options?.[index]?.values ?? [];

        return (
          <div key={field.id} className="border p-4 rounded-xl space-y-2">
            <Input
              {...register(`options.${index}.name`)}
              placeholder="Option Name (e.g. Color)"
            />
            <Input
              placeholder="Comma-separated values (e.g. Red, Blue, Green)"
              value={currentValues.join(", ")}
              onChange={(e) => {
                const values = e.target.value
                  .split(",")
                  .map((v) => v.trim())
                  .filter(Boolean);
                setValue(`options.${index}.values`, values);
              }}
            />
            <Button variant="destructive" onClick={() => remove(index)}>
              Remove Option
            </Button>
          </div>
        );
      })}
      <Button type="button" onClick={() => append({ name: "", values: [] })}>
        Add Option
      </Button>
    </div>
  );
}
