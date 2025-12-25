import { useState } from 'react'
import { UserPlus, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useGetUsers } from '../../api/user'
import { useGetGroups } from '../../api/group'
import { useDebouncedValue } from '@/hooks'
import { UserFilters } from './user-filters'
import { UserItem, UserItemSkeleton } from './user-item'
import { UserPagination } from './user-pagination'
import { UserDialog } from './user-dialog'

const PAGE_SIZE = 15
const ALL_FILTER = 'all'

export function UserList() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState(ALL_FILTER)
  const [groupFilter, setGroupFilter] = useState(ALL_FILTER)
  const [page, setPage] = useState(1)

  const debouncedSearch = useDebouncedValue(search, 300)
  const { data: groups = [] } = useGetGroups()

  const { data, isLoading, isFetching } = useGetUsers({
    search: debouncedSearch || undefined,
    role: roleFilter !== ALL_FILTER ? (roleFilter as any) : undefined,
    groupId: groupFilter !== ALL_FILTER ? groupFilter : undefined,
    page,
    limit: PAGE_SIZE,
  })

  const users = data ?? []
  const total = data?.total ?? 0
  const totalPages = Math.ceil(total / PAGE_SIZE)

  // Reset page when filters change
  const handleSearchChange = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  const handleRoleFilterChange = (value: string) => {
    setRoleFilter(value)
    setPage(1)
  }

  const handleGroupFilterChange = (value: string) => {
    setGroupFilter(value)
    setPage(1)
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              All Members ({total})
            </CardTitle>
            <CardDescription className="mt-1.5">
              View and manage all users in the system
            </CardDescription>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)} size="sm">
            <UserPlus className="mr-2 h-4 w-4" />
            + Add User
          </Button>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Filters */}
          <UserFilters
            search={search}
            onSearchChange={handleSearchChange}
            roleFilter={roleFilter}
            onRoleFilterChange={handleRoleFilterChange}
            groupFilter={groupFilter}
            onGroupFilterChange={handleGroupFilterChange}
            groups={groups}
          />

          {/* Table Header */}
          <div className="rounded-lg border border-border overflow-hidden">

            {/* Table Body */}
            {isLoading ? (
              <div>
                {[...Array(5)].map((_, i) => (
                  <UserItemSkeleton key={i} />
                ))}
              </div>
            ) : users.length === 0 ? (
              <EmptyState
                hasFilters={!!debouncedSearch || roleFilter !== ALL_FILTER || groupFilter !== ALL_FILTER}
                onClearFilters={() => {
                  setSearch('')
                  setRoleFilter(ALL_FILTER)
                  setGroupFilter(ALL_FILTER)
                  setPage(1)
                }}
                onCreateClick={() => setCreateDialogOpen(true)}
              />
            ) : (
              <div className={isFetching ? 'opacity-60' : ''}>
                {users.map((user) => (
                  <UserItem key={user.username} user={user} groups={groups} />
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <UserPagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
              isLoading={isFetching}
            />
          )}
        </CardContent>
      </Card>

      {/* Create User Dialog */}
      <UserDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        user={null}
      />
    </>
  )
}

interface EmptyStateProps {
  hasFilters: boolean
  onClearFilters: () => void
  onCreateClick: () => void
}

function EmptyState({ hasFilters, onClearFilters, onCreateClick }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-muted p-3 mb-4">
        <Users className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold">No users found</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-sm">
        {hasFilters
          ? 'No users match your current filters. Try adjusting your search criteria.'
          : 'Get started by adding your first user to the system.'}
      </p>
      {hasFilters ? (
        <Button onClick={onClearFilters} variant="outline" className="mt-4" size="sm">
          Clear Filters
        </Button>
      ) : (
        <Button onClick={onCreateClick} className="mt-4" size="sm">
          <UserPlus className="mr-2 h-4 w-4" />
          Add First User
        </Button>
      )}
    </div>
  )
}

