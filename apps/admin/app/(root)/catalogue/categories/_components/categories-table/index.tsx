"use client"
import { columns } from "./columns"
import { useRouter } from "next/navigation"
import { Category } from "@bs42/db/client"
import DataTableTree from "@/components/data-table-tree"
import { buildNodeTree } from "@bs42/utils"

interface CategoriesTableProps {
  categories: Category[]
}

const CategoriesTable = ({ categories }: CategoriesTableProps) => {
  const router = useRouter()
  const categoryTree = buildNodeTree(categories)
  return <DataTableTree columns={columns} data={categoryTree} onRowClick={(category) => router.push(`/catalogue/categories/${category.id}/edit`)} />
}

export default CategoriesTable
