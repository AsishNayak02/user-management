"use client"
import { getAllRoles, searchRoles } from "@/api/roleManagement"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RoleTable } from "@/components/role-definition/RoleTable"
import { CreateRoleForm } from "@/components/role-definition/CreateRoleForm"
import { RoleDefinition } from "@/lib/types/role"
import { useEffect, useState } from "react"

export default function RoleDefinitionPage() {
  const [roles, setRoles] = useState<RoleDefinition[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Load roles on component mount
  useEffect(() => {
    loadRoles();
  }, [])

  // Load roles with search term
  const loadRoles = async (search: string = '') => {
    setIsLoading(true);
    try {
      const response = search 
        ? await searchRoles(search)
        : await getAllRoles();
      
      setRoles(response.data);
    } catch (error) {
      console.error('Error loading roles:', error);
    } finally {
      setIsLoading(false);
    }
  }

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadRoles(searchTerm);
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchTerm])

  const handleRoleUpdated = () => {
    loadRoles(searchTerm);
  }

  const handleRoleDeleted = (roleId: string) => {
    setRoles(prev => prev.filter(role => role.id !== roleId));
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="flex flex-col gap-1">
        <span className="font-semibold text-2xl">Role Definition</span>
        <span className="text-muted-foreground">
          Create, View, and Manage all realm roles and their client role assignments.
        </span>
      </div>
      
      <div className="flex flex-col gap-2">
        <div className="flex flex-row items-center justify-between">
          <span>
            {searchTerm ? `Search Results` : `All Roles`} 
            <span className="ml-1">({roles.length})</span>
          </span>
          <div className="flex flex-row items-center gap-x-3">
            <Input 
              placeholder="Search roles..." 
              className="w-xs ml-4" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button variant="outline">
              <span className="mr-2">🔍</span>
              Filter
            </Button>
            <CreateRoleForm onRoleCreated={handleRoleUpdated} />
          </div>
        </div>
        
        <div>
          <RoleTable 
            roles={roles} 
            onRoleUpdated={handleRoleUpdated}
            onRoleDeleted={handleRoleDeleted}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  )
}
