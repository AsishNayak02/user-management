"use client"
import { getAllUsers } from "@/api/userListing"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTableDemo } from "@/components/user-management/UserTable"
import { AddUserForm } from "@/input-components/AddUserForm"
import { USER_ATTR } from "@/lib/utils.user"
import { ListFilter } from "lucide-react"
import { useEffect, useState } from "react"


export default function UserManagementPage() {
  const [rows, setRows] = useState<USER_ATTR[]>([])
  useEffect(() => {
      getAllUsers()
        .then((res) => { setRows(res.data) })
        .catch((err) => { console.log(err) });
    }, [])

  return (
        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="flex flex-col gap-1">
            <span className="font-semibold text-2xl">User Management</span>
            <span className="text-muted-foreground">Create, View, and Manage all users in the system.</span>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex flex-row items-center justify-between">
              <span>All Users <span>({rows?.length??0})</span></span>
              <div className="flex flex-row items-center gap-x-3">
              <Input placeholder="Search users..." className="w-xs ml-4" />
              <Button><ListFilter />Filter</Button>
              <AddUserForm />
              </div>
            </div>
            <div>
              <DataTableDemo rows={rows} setRows={setRows}></DataTableDemo>
            </div>
          </div>
        </div>
  )
}
