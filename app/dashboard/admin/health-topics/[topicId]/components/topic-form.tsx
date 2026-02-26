"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { Resolver } from "react-hook-form";

import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import * as z from "zod";

import MDEditor from "@uiw/react-md-editor";
import ReactMarkdown from "react-markdown";

import { Button } from "@/components/ui/button";
import { AlertModal } from "@/components/ui/dashboard/alert-modal";
import { Heading } from "@/components/ui/dashboard/heading";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { LuTrash2 as Trash } from "react-icons/lu";

import type { Product, HealthTopic, HealthTopicProduct } from "@/generated/prisma";

/**
 * Zod schema for creating/updating HealthTopic
 * - Keep defaults so form fields always receive strings/arrays
 */
export const healthTopicSchema = z.object({
  title: z.string().min(1, "Title is required"),
  handle: z.string().min(1, "Handle is required"),
  description: z.string().optional().default(""),
  relatedProductIds: z.array(z.string()).optional().default([]),
  seo: z
    .object({
      title: z.string().optional().default(""),
      description: z.string().optional().default(""),
    })
    .optional()
    .default({ title: "", description: "" }),
});

export type HealthTopicFormValues = z.infer<typeof healthTopicSchema>;

interface TopicFormProps {
  initialData:
    | (HealthTopic & {
        relatedProducts?: (HealthTopicProduct & {
          product: Pick<Product, "id" | "title">;
        })[];
        seo?: { title?: string | null; description?: string | null } | null;
      })
    | null;
  // allProducts is a fallback list; search will be used primarily
  allProducts: { id: string; title: string; handle?: string }[];
}

export const TopicForm: React.FC<TopicFormProps> = ({ initialData, allProducts }) => {
  const params = useParams();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Editor/preview
  const [editorTab, setEditorTab] = useState<"editor" | "preview">("editor");

  // Product search
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<{ id: string; title: string; handle?: string }[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const titleText = initialData ? "Edit topic" : "Create topic";
  const descriptionText = initialData ? "Update topic details" : "Add a new topic";
  const toastMessage = initialData ? "Topic updated." : "Topic created.";
  const actionText = initialData ? "Save changes" : "Create";

  // typed resolver so TS knows resolver matches form values
  const typedResolver = zodResolver(healthTopicSchema) as Resolver<HealthTopicFormValues>;

  const form = useForm<HealthTopicFormValues>({
    resolver: typedResolver,
    defaultValues: initialData
      ? {
          title: initialData.title ?? "",
          handle: (initialData as any).handle ?? "",
          description: (initialData as any).description ?? "",
          seo: (initialData as any).seo ?? { title: "", description: "" },
          relatedProductIds: initialData.relatedProducts?.map((p) => p.product.id) ?? [],
        }
      : {
          title: "",
          handle: "",
          description: "",
          seo: { title: "", description: "" },
          relatedProductIds: [],
        },
  });

  // Debounced product search
  
useEffect(() => {
  const q = searchTerm.trim();

  
  if (q.length < 2) {
    setSearchResults([]);
    setIsSearching(false);
    return;
  }

  setIsSearching(true);
  const t = setTimeout(async () => {
    try {
      // 1) Request - make sure param name is the one your API expects.
      // If your API uses `q` use the line below. If it uses `query` change to { params: { query: q } }.
      const res = await axios.get("/api/admin/products", { params: { q } });

      // 2) Normalize response shape:
      // - some endpoints return the array directly: res.data === Product[]
      // - others return { data: Product[], meta: {...} }
      const items: { id: string; title: string; handle?: string }[] =
        Array.isArray(res.data) ? res.data : Array.isArray(res.data?.data) ? res.data.data : [];

      // 3) Filter out already-linked products
      const linked = new Set(form.getValues("relatedProductIds") || []);
      setSearchResults(items.filter((it) => !linked.has(it.id)));
    } catch (err) {
      console.error("Product search error:", err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, 300);

  return () => clearTimeout(t);
}, [searchTerm, form]);


  const onSubmit = async (data: HealthTopicFormValues) => {
    try {
      setLoading(true);

      if (initialData) {
        await axios.patch(`/api/admin/health-topics/${params.topicId}`, data);
      } else {
        await axios.post(`/api/admin/health-topics`, data);
      }

      router.refresh();
      router.push(`/dashboard/admin/health-topics`);
      toast.success(toastMessage);
    } catch (error) {
      console.error("Error saving topic:", error);
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(`/api/admin/health-topics/${params.topicId}`);
      router.push(`/dashboard/admin/health-topics`);
      toast.success("Topic deleted.");
    } catch (error) {
      console.error("Error deleting topic:", error);
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  const toggleProductLink = (productId: string) => {
    const current: string[] = form.getValues("relatedProductIds") || [];
    const exists = current.includes(productId);
    const next = exists ? current.filter((id) => id !== productId) : [...current, productId];
    form.setValue("relatedProductIds", next);
    // If search results exist, remove added item from results to avoid duplication
    setSearchResults((s) => s.filter((r) => r.id !== productId));
  };

  // fallback products to display (when no search) — exclude linked ones
  const linkedSet = new Set(form.getValues("relatedProductIds") || []);
  const fallbackProducts = allProducts.filter((p) => !linkedSet.has(p.id)).slice(0, 50);

  return (
    <>
      <AlertModal isOpen={open} onClose={() => setOpen(false)} onConfirm={onDelete} loading={loading} />

      <div className="flex items-center justify-between">
        <Heading title={titleText} description={descriptionText} />
        {initialData && (
          <Button disabled={loading} variant="destructive" size="sm" onClick={() => setOpen(true)}>
            <Trash className="h-4 w-4" />
          </Button>
        )}
      </div>

      <Separator />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full">
          {/* Title + Handle */}
          <div className="grid md:grid-cols-2 gap-8">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input disabled={loading} placeholder="Topic title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="handle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Handle</FormLabel>
                  <FormControl>
                    <Input disabled={loading} placeholder="topic-handle" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Markdown editor + preview */}
          <div className="bg-white rounded-lg p-6 border">
            <div className="flex items-center justify-between mb-4">
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setEditorTab("editor")}
                  className={`px-3 py-1 rounded ${editorTab === "editor" ? "bg-indigo-600 text-white" : "bg-gray-100"}`}
                >
                  Editor
                </button>
                <button
                  type="button"
                  onClick={() => setEditorTab("preview")}
                  className={`px-3 py-1 rounded ${editorTab === "preview" ? "bg-indigo-600 text-white" : "bg-gray-100"}`}
                >
                  Preview
                </button>
              </div>
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <div>
                  {editorTab === "editor" ? (
                    <div data-color-mode="light">
                      <MDEditor
                        value={field.value ?? ""}
                        onChange={(v) => field.onChange(v ?? "")}
                        height={400}
                      />
                    </div>
                  ) : (
                    <div className="prose max-w-none p-4 bg-gray-50 border rounded min-h-[200px]">
                      <ReactMarkdown>{field.value ?? ""}</ReactMarkdown>
                    </div>
                  )}
                </div>
              )}
            />
          </div>

          {/* Product search + linking */}
          <div className="bg-white rounded-lg p-4 border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium">Related Products</h3>
              <div className="text-xs text-gray-500">Search and assign products</div>
            </div>

            <div className="mb-3">
              <Input
                placeholder="Search products (type at least 2 chars)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {isSearching && <div className="text-xs text-gray-500 mt-1">Searching...</div>}
            </div>

            {/* Search results */}
            {searchResults.length > 0 ? (
              <div className="space-y-2 mb-3 max-h-48 overflow-y-auto">
                {searchResults.map((r) => (
                  <div
                    key={r.id}
                    onClick={() => toggleProductLink(r.id)}
                    className="flex items-center justify-between p-3 rounded cursor-pointer hover:bg-gray-100 border"
                  >
                    <div>
                      <div className="font-medium">{r.title}</div>
                      <div className="text-xs text-gray-500">{r.handle}</div>
                    </div>
                    <div className="text-indigo-600">+ Link</div>
                  </div>
                ))}
              </div>
            ) : (
              // fallback list
              <div className="space-y-2 mb-3 max-h-48 overflow-y-auto">
                {fallbackProducts.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => toggleProductLink(p.id)}
                    className="flex items-center justify-between p-3 rounded cursor-pointer hover:bg-gray-100 border"
                  >
                    <div>
                      <div className="font-medium">{p.title}</div>
                      <div className="text-xs text-gray-500">{p.handle}</div>
                    </div>
                    <div className="text-indigo-600">+ Link</div>
                  </div>
                ))}
              </div>
            )}

            {/* Currently linked */}
            <div className="mt-2">
              <h4 className="text-xs font-medium mb-2">Linked ({(form.getValues("relatedProductIds") || []).length})</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {(form.getValues("relatedProductIds") || []).length === 0 ? (
                  <div className="text-sm text-gray-500">No products linked yet.</div>
                ) : (
                  (form.getValues("relatedProductIds") || []).map((id) => {
                    // try to find title from allProducts or searchResults
                    const product =
                      allProducts.find((a) => a.id === id) || searchResults.find((s) => s.id === id);
                    return (
                      <div
                        key={id}
                        className="flex items-center justify-between p-2 rounded bg-indigo-50 border-indigo-200"
                      >
                        <div className="truncate">
                          <div className="font-mono text-sm">{product?.title ?? id}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleProductLink(id)}
                          className="text-xs text-red-600 hover:text-red-800"
                        >
                          Unlink
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* SEO */}
          <div className="grid md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="seo"
              render={({ field }) => {
                const seoVal = field.value ?? { title: "", description: "" };
                return (
                  <>
                    <FormItem>
                      <FormLabel>SEO Title</FormLabel>
                      <FormControl>
                        <Input
                          disabled={loading}
                          value={seoVal.title ?? ""}
                          onChange={(e) => form.setValue("seo", { ...(field.value ?? {}), title: e.target.value })}
                          placeholder="SEO title"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>

                    <FormItem>
                      <FormLabel>SEO Description</FormLabel>
                      <FormControl>
                        <Textarea
                          disabled={loading}
                          rows={3}
                          value={seoVal.description ?? ""}
                          onChange={(e) => form.setValue("seo", { ...(field.value ?? {}), description: e.target.value })}
                          placeholder="Meta description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  </>
                );
              }}
            />
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end">
            <Button disabled={loading} type="submit">
              {actionText}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
};

export default TopicForm;
