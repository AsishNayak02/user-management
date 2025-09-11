"use client"
import { getAllUsers } from "@/api/userListing"
import { Button } from "@/components/ui/button"
import { USER_ATTR } from "@/lib/utils.user"
import { CirclePlus } from "lucide-react"
import { useEffect, useState } from "react"
import { RolesTable } from "./RoleTable"


export default function RoleDefinition() {
  const [rows, setRows] = useState<USER_ATTR[]>([])
  useEffect(() => {
      getAllUsers()
        .then((res) => { setRows(res.data) })
        .catch((err) => { console.log(err) });
    }, [])

  return (
        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="flex flex-col gap-1">
            <span className="font-semibold text-2xl">Role Definition</span>
            <span className="text-muted-foreground">Create, View, and Manage all roles in the system.</span>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex flex-row items-center justify-between">
              <span>All Roles <span>({rows?.length??0})</span></span>
              <Button><CirclePlus />Create Role</Button>
            </div>
            <div>
              <RolesTable rows={rows} setRows={setRows}></RolesTable>
            </div>
          </div>
        </div>
  )
}
