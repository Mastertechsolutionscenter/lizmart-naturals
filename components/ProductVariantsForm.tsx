import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useEffect } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";

interface VariantFormValues {
  title: string;
  priceAmount: string;
  priceCurrency: string;
  availableForSale: boolean;
  selectedOptions: { name: string; value: string }[];
}

export function ProductVariantsForm({
  options,
  initialVariants = [], // ✅ allow initial variants as prop
}: {
  options: { name: string; values: string[] }[];
  initialVariants?: VariantFormValues[];
}) {
  const { control, register, setValue, watch } =
    useFormContext<{ variants: VariantFormValues[] }>();

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "variants",
  });

  const currentVariants = watch("variants");

  // ✅ Prefill with initial variants if empty
  useEffect(() => {
    if ((!currentVariants || currentVariants.length === 0) && initialVariants.length > 0) {
      replace(initialVariants);
    }
  }, [initialVariants, currentVariants, replace]);
 
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Product Variants</h3>
      {fields.map((field, index) => {
        const selectedOptions = currentVariants?.[index]?.selectedOptions ?? [];

        return (
          <div key={field.id} className="border p-4 rounded-xl space-y-3">
            {/* Title */}
            <Input {...register(`variants.${index}.title`)} placeholder="Variant Title" />

            {/* Price */}
            <Input
              {...register(`variants.${index}.priceAmount`)}
              placeholder="Price (e.g. 120.00)"
              type="number"
            />

            {/* Currency */}
            <Input disabled {...register(`variants.${index}.priceCurrency`)} placeholder="Currency (e.g. KES)" />

            {/* Selected Options */}
            {options.map((option, optIndex) => (
              <select
                key={optIndex}
                className="border rounded p-2 w-full"
                value={selectedOptions?.[optIndex]?.value ?? ""}
                onChange={(e) => {
                  const selected = e.target.value;
                  const updated = [...selectedOptions];
                  updated[optIndex] = { name: option.name, value: selected };
                  setValue(`variants.${index}.selectedOptions`, updated);
                }}
              >
                <option value="">Select {option.name}</option>
                {option.values.map((val, vIndex) => (
                  <option key={vIndex} value={val}>
                    {val}
                  </option>
                ))}
              </select>
            ))}

            {/* Available for Sale */}
            <div className="flex items-center space-x-2">
              <Switch
                checked={currentVariants?.[index]?.availableForSale ?? false}
                onCheckedChange={(checked) =>
                  setValue(`variants.${index}.availableForSale`, checked)
                }
              />
              <span>Available for Sale</span>
            </div>

            <Button type="button" variant="destructive" onClick={() => remove(index)}>
              Remove Variant
            </Button>
          </div>
        );
      })}

      <Button
        type="button"
        onClick={() =>
          append({
            title: "",
            priceAmount: "",
            priceCurrency: "KES",
            availableForSale: true,
            selectedOptions: [],
          })
        }
      >
        Add Variant
      </Button>
    </div>
  );
}
