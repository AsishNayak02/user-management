"use client"
import { getAllUsers, searchUsers } from "@/api/userListing"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { UserTable } from "@/components/user-management/UserTable"
import { AddUserForm } from "@/components/user-management/AddUserForm"
import { USER_ATTR } from "@/lib/utils.user"
import { ListFilter } from "lucide-react"
import { useEffect, useState } from "react"


export default function UserManagementPage() {
  const [rows, setRows] = useState<USER_ATTR[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isSearching, setIsSearching] = useState(false)

  // Load users on component mount
  useEffect(() => {
    loadUsers();
  }, [])

  // Load users with search term
  const loadUsers = async (search: string = '') => {
    setIsSearching(true);
    try {
      const response = search 
        ? await searchUsers(search, 'all')
        : await getAllUsers();
      
      setRows(response.data);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setIsSearching(false);
    }
  }

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadUsers(searchTerm);
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchTerm])

  return (
        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="flex flex-col gap-1">
            <span className="font-semibold text-2xl">User Management</span>
            <span className="text-muted-foreground">Create, View, and Manage all users in the system.</span>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex flex-row items-center justify-between">
              <span>
                {searchTerm ? `Search Results` : `All Users`} 
                <span className="ml-1">{rows.length}</span>
                {isSearching && <span className="ml-2 text-sm text-muted-foreground">(Searching...)</span>}
              </span>
              <div className="flex flex-row items-center gap-x-3">
              <Input 
                placeholder="Search users..." 
                className="w-xs ml-4" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button><ListFilter />Filter</Button>
              <AddUserForm />
              </div>
            </div>
            <div>
              <DataTableDemo 
                rows={rows} 
                setRows={setRows} 
                onUserUpdated={() => loadUsers(searchTerm)}
              />
            </div>
          </div>
        </div>
  )
}
