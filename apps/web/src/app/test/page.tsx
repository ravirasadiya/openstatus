"use client";

import { MarketingLayout } from "@/components/layout/marketing-layout";

import { DataTable } from "./_components/data-table";
import { columns } from "./_components/columns";
import type { Schema } from "./_components/utils";

export default async function TestPage() {
  return (
    // <MarketingLayout>
    <div className="w-full rounded-lg border bg-background p-6">
      <DataTable columns={columns} data={data} />
    </div>
    // </MarketingLayout>
  );
}

const data = [
  {
    name: "Test",
    public: true,
    active: false,
    regions: ["ams", "gru", "syd"],
  },
  {
    name: "Test 2",
    public: false,
    active: true,
    regions: ["ams", "syd"],
  },
  {
    name: "Test 3",
    public: true,
    active: false,
    regions: ["ams", "gru"],
  },
  {
    name: "Test 4",
    public: true,
    active: true,
    regions: ["syd"],
  },
  {
    name: "Test 5",
    public: false,
    active: false,
    regions: ["gru"],
  },
  {
    name: "Test 6",
    public: true,
    active: true,
    regions: ["ams", "syd"],
  },
  {
    name: "Test 7",
    public: true,
    active: false,
    regions: ["ams"],
  },
  {
    name: "Test 8",
    public: false,
    active: false,
    regions: ["syd"],
  },
  {
    name: "Test 9",
    public: true,
    active: false,
    regions: ["ams", "gru"],
  },
] satisfies Schema[];
