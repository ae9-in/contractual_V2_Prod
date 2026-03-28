"use client"

import { useParams } from "next/navigation"
import { ContractDetailPage } from "@/src/views/ContractDetail"

export default function ContractDetailRoute() {
  const { id } = useParams<{ id: string }>()
  return <ContractDetailPage contractId={id} />
}
